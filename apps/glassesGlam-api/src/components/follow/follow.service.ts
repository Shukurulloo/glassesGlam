import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import {
	lookupAuthMemberFollowed,
	lookupAuthMemberLiked,
	lookupFollowerData,
	lookupFollowingData,
} from '../../libs/config';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private readonly memberService: MemberService,
	) {}

	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		// stringa o'tkazib qiymatlarni solishtramz, to'g'ridan-to'gri solishtrolmaymz chunki ularni qiymati bir xil bo'lsaham referencelari har xil bo'ladi
		if (followerId.toString() === followingId.toString()) { // o'ziga o'zi follow bo'lolmaydigon mantiq
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}

		const targetMember = await this.memberService.getMember(null, followingId); // null view o'zgarmasligi un. followingId: subsribe bo'lmoqchi bo'gan memberni datasini arg, pass qilamz
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = await this.registerSubscription(followerId, followingId);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: 1 }); // memberni static datasi yangilanadi
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: 1 }); // memberni static datasi yangilanadi

		return result;
	}

	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			//follow hosl qilamz
			return await this.followModel.create({
				followingId: followingId,
				followerId: followerId,
			});
		} catch (err) {
			console.log('Error, Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED); // databace qabul qilmasa badrequest errni ishlatamz
		}
	}

	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		const targetMember = await this.memberService.getMember(null, followingId); // null view o'zgarmasligi un. followingId: subsribe bo'lmoqchi bo'gan memberni datasini arg, pass qilamz
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = await this.followModel.findOneAndDelete({
			followingId: followingId,
			followerId: followerId,
		}).exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: -1 }); // memberni static datasi yangilanadi
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: -1 });

		return result;
	}

	// MEMBERID => DAVID

	public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST);
		const match: T = { followerId: search?.followerId };
		console.log('match:', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							// meLiked
							lookupAuthMemberLiked(memberId, '$followingId'),
							// meFollowed
							lookupAuthMemberFollowed({
								followerId: memberId, //David
								followingId: '$followingId', // Shawn
							}),
							lookupFollowingData, // biz follow bo`lgan memberni to`liq malumotini olib beradi
							{ $unwind: '$followingData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	// public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
	// 	const { page, limit, search } = input;
	// 	if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST); //followerId kirtilishi ithiyori bo'gani un agar kirtlmasa backend validationni ishlatamz

	// 	const match: T = { followerId: search?.followerId };
	// 	console.log('match:', match);

	// 	const result = await this.followModel
	// 		.aggregate([
	// 			{ $match: match }, // KO'RISH UCHUN LOG
	// 			{ $sort: { createdAt: Direction.DESC } }, // desending
	// 			{
	// 				// facet 2ta agrigationga bo'lamz uni alohida pipeLinelari bor,
	// 				$facet: {
	// 					list: [
	// 						{ $skip: (page - 1) * limit }, //pagination:
	// 						{ $limit: limit },
	// 						lookupAuthMemberLiked(memberId, '$followingId'), //  "$followingId" shu followingga like bosilganmi bilish un uni idsi
	// 						lookupAuthMemberFollowed({ 
	// 							followerId: memberId, 
	// 							followingId: '$followingId' }),
	// 						lookupFollowingData, // meFollowed
	// 						{ $unwind: '$followingData' },
	// 					],

	// 					metaCounter: [{ $count: 'total' }], // databacedagi umimiy follow sonini beradi
	// 				},
	// 			},
	// 		])
	// 		.exec();
	// 	if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

	// 	return result[0];
	// }

	public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST); //followerId kirtilishi ithiyori bo'gani un agar kirtlmasa backend validationni ishlatamz

		const match: T = { followingId: search?.followingId };
		console.log('match:', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } }, // desending
				{
					// facet 2ta alohida pipeLinega ajratamz
					$facet: {
						list: [
							{ $skip: (page - 1) * limit }, //pagination:
							{ $limit: limit },
							lookupAuthMemberLiked(memberId, '$followerId'),
							lookupAuthMemberFollowed({ 
								followerId: memberId, 
								followingId: '$followerId' }),
							lookupFollowerData,
							{ $unwind: '$followerData' },
						],

						metaCounter: [{ $count: 'total' }], // databacedagi umimiy follow sonini beradi
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
