import { ObjectId } from 'bson'; // mongooseni o'rniga bson dan foydalanib objectIdga o'giramz

// shular bo'yicha sort qilsin degan mantiq
export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank']; // agents
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews']; // all
export const availableOptions = ['propertyBarter', 'propertyRent'];
export const availablePropertySorts = [
	'createdAt',
	'updatedAt',
	'propertyLikes',
	'propertyViews',
	'propertyRank',
	'propertyPrice',
];
export const availableBoardArticleSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

/**  IMAGE CONFIGURATION **/
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']; // img formati
export const getSerialForImage = (filename: string) => {
	//random name
	const ext = path.parse(filename).ext; //extension ni .jpg kabi formatini biriktiramz
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target; //shart: agar string bo'lsa ObjectIdga wrap qilsin aks holda  targetni o'zini qaytarsin
};

//complex query. $_id => shuyerda hosl bo'gan propertilar ichidagi id ni qabul qilish un//  targetRefId kiritilmaganda shuyerga qo'yamz
export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	// targetRefId => propertilar Idsi
	return {
		$lookup: {
			from: 'likes',
			let: {
				// search mehanizmini hosl qilish un variablelar
				localLikeRefId: targetRefId, // "$_id"
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						// solishtramz
						// $expr => bir nechta narsani match qilish un.
						$expr: {
							// local variableni ishlatish un $$ kerak. $ bu esa o'qish un
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }], // aynan nimani solishtramz
						}, // likeRefIdimz localLikeRefId ga teng bo'gan holatni topishni buyurdik
					},
				},
				{
					$project: {
						// project bu qurish hohlagan usulda
						_id: 0, // idni olib bermasin byDefault  hardoim 1 hisoblanadi
						memberId: 1, // qolgan datasetlar  byDefault 0 bo'ladi shuning un 1 qilamz kerakli un
						likeRefId: 1,
						myFavorite: '$$localMyFavorite', // hammasi to'g'ri ishlasa local variableni qiymatini o'zini  joylaymz
					},
				},
			],
			// hosil qilingan pipeLine saqlash
			as: 'meLiked', // shu nom bilan
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}
export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				// search mehanizmini hosl qilish un variablelar
				localFollowerId: followerId,
				localFollowingId: followingId, // "$followingId"
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						// $expr => bir nechta narsani match qilish un.
						$expr: {
							// local variableni ishlatish un $$ kerak
							$and: [{ $eq: ['$followerId', '$$localFollowerId'] }, { $eq: ['$followingId', '$$localFollowingId'] }], // aynan nimani solishtramz
						}, // likeRefIdimz localLikeRefId ga teng bo'gan holatni topishni buyurdik
					},
				},
				{
					$project: {
						_id: 0, // idni olib bermasin byDefault  hardoim 1 hisoblanadi
						followerId: 1, // qolgan datasetlar  byDefault 0 bo'ladi shuning un 1 qilamz kerakli un
						followingId: 1,
						myFollowing: '$$localMyFavorite', // hammasi to'g'ri ishlasa local variableni qiymatini o'zini  joylaymz
					},
				},
			],
			// hosil qilingan pipeLine saqlash
			as: 'meFollowed', // shu nom bilan
		},
	};
};

// authenticed bo'gan user bo'lsa uni
export const lookupMember = {
	$lookup: {
		from: 'members', // qaysi collectiondan qayerdan izlash
		localField: 'memberId',
		foreignField: '_id', // _id bo'yicha
		as: 'memberData', // nomini memberData qilib qaytar
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members', // qaysi collectiondan qayerdan izlash
		localField: 'followingId',
		foreignField: '_id', // _id bo'yicha
		as: 'followingData', // nomini
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

/** yuqorida hosil bo'lgan natijani qiymatidan foydalanib 
 	 favoriteProperty ichdan memberId qabul qilinb members collectionidan izlab natijani
 	 favoriteProperty ni ichidagi memberData ga joylab beryapti */
export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteProperty.memberId',
		foreignField: '_id',
		as: 'favoriteProperty.memberData',
	},
};
