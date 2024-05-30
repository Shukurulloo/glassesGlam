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

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg']; // img formati
export const getSerialForImage = (filename: string) => {
	//random name
	const ext = path.parse(filename).ext; //extension ni .jpg kabi formatini biriktiramz
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target; //shart: agar string bo'lsa ObjectIdga wrap qilsin aks holda  targetni o'zini qaytarsin
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
		from: 'members', // qaysi collectiondan qayerdan izlash
		localField: 'followerId',
		foreignField: '_id', // _id bo'yicha
		as: 'followerData',
	},
};
