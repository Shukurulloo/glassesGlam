import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { Follower, Following, MeFollowed } from '../../libs/dto/follow/follow';
import { lookupAuthMemberLiked } from '../../libs/config';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable() // asosiy mantiqlar
export class MemberService {
	// Memberni inject qili, memberModel schemani ulaymiz, Crud uchun
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
		private notificationService: NotificationService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword); // hash password
		try {
			// databace errori o'zgartrish uchun try catchni  ishlatamz
			const result = await this.memberModel.create(input); // result memberni qayataradi
			result.accessToken = await this.authService.createToken(result); // kribkegan resultni ichidan accessToken ni create qilamz
			return result;
		} catch (err) {
			console.log('Error, service.model:', err.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE); // databace errorini o'rniga customized
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input; // yoyib olamz, destruction
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick })
			.select('+memberPassword') //select memberPasswordni majburiy olib beradi, yangi usul
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			// agar response bo'lmasa yoki o'zini delete qilgan bo'lsa
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK); // libsda bor
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			// va yana blok qilingan bo'lsa
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		//  passwordsni solishtramz
		const isMatch = await this.authService.comparePasswords(input.memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);
		response.accessToken = await this.authService.createToken(response); //token create qilamz

		return response;
	}

	public async updateMember(memberId: ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE, // faqat activlar
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED); // o'zgargan data bo'lsa keyinga o'tkaz

		result.accessToken = await this.authService.createToken(result); //accessTokenniham qayta quramz. agar yangilamsak frontenda o'zgarmaydi
		return result;
	}

	//parametrda brinchi memberId tomosha qilayotgan inson, ikkinchi talab etilgan data
	public async getMember(memberId: ObjectId, targetId: ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK], // atvive va block bo'gan userlarni ko'rsatadi
			},
		};
		const targetMember = await this.memberModel.findOne(search).lean().exec(); // lean: dokumentni javscriptni objectiga aylantradi
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			//auth bo'gan user bo'lsa
			// memberId-kimTomoshaQilishi.    targetId-qaysiMemberniTomoshaQilishimz. ViewGroup.MEMBERniTomoshaQiladi
			const viewInput = { memberId: memberId, viewRefId: targetId, viewGroup: ViewGroup.MEMBER };
			const newView = await this.viewService.recordView(viewInput); //yangi viewHoslQilamz
			if (newView) {
				// agar yangi viewHosl bo'lsa viewni 1taga oshir
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++; // lean orqali targetMemberni qiymatini oshiramz
			}
		}

		// meLiked o'sha memberga like bosilgani tekshiriladi
		const likeInput = { memberId: memberId, likeRefId: targetId, likeGroup: LikeGroup.MEMBER };
		targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);

		//mefollowed o'sha memberga subscripe qilingani
		targetMember.meFollowed = await this.checkSubscription(memberId, targetId); // memberId bu followerId, targetId followingId
		return targetMember;
	}

	private async checkSubscription(followerId: ObjectId, followingId: ObjectId): Promise<MeFollowed[]> {
		const result = await this.followModel.findOne({ followingId: followingId, followerId: followerId }).exec();
		return result ? [{ followingId: followingId, followerId: followerId, myFollowing: true }] : [];
	}

	public async getAgents(memberId: ObjectId, input: AgentsInquiry): Promise<Members> {
		const { text } = input.search; // text search qilinsa
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE }; //active agentlarni ol
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; //kelayotgan inputni ichidan sortni qabul qilamz, yani bo'lsa o'zi bo'lmsa createdAt obtional

		//dinamic usul: agar kelayotgan inputni ichida direction bo'lsa o'zi bo'lmasa Desc(yuqoridan pastga)
		if (text) match.memberNick = { $regex: new RegExp(text, 'i') }; // flagini i qilib harfni katta kichik va harflar ketma-ketligi o'xshash bo'lsa ham farqsz qidirishini belgilaymiz
		console.log('match:', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					// facet bir nechta aggregate pipelarni bir vaqtni o'zida ishlatishga imkon beradi
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit },lookupAuthMemberLiked(memberId)], // $_id
						metaCounter: [{ $count: 'total' }], // databacedagi umimiy memberlar sonini beradi
					},
				},
			])
			.exec();
		console.log('result:', result);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetMember(memberId: ObjectId, likeRefId: ObjectId): Promise<Member> {
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.MEMBER, // memberlarga like
		};

		const modifier: number = await this.likeService.toggleLike(input); //likeService
		const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier }); // memberni static datasi yangilanadi

		const AuthMember: Member = await this.memberModel
			.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
			.exec();
		if (!AuthMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const notificInput = {
			notificationType: NotificationType.LIKE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.MEMBER,
			notificationTitle: 'Like',
			notificationDesc: `${AuthMember.memberNick} Liked your photo `,
			authorId: memberId,
			receiverId: target._id,
		};

		await this.notificationService.createNotification(notificInput);

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllMembersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, memberType, text } = input.search; // text search qilinsa
		const match: T = {}; // hama turdagi userlar
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; //kelayotgan inputni ichidan sortni qabul qilamz, yani bo'lsa o'zi bo'lmsa createdAt obtional

		if (memberStatus) match.memberStatus = memberStatus; // agar memberStatus bo'lsa matchga briktramz
		if (memberType) match.memberType = memberType; // agar memberType bo'lsa matchga briktramz

		if (text) match.memberNick = { $regex: new RegExp(text, 'i') }; // flagini i qilib harfni katta kichik va harflar ketma-ketligi o'xshash bo'lsa ham farqsz qidirishini belgilaymiz
		console.log('match:', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }], //pagination: talab etilgan agentlarni ro'yhatini olib beradi
						metaCounter: [{ $count: 'total' }], // databacedagi umimiy memberlar soni
					},
				},
			])
			.exec();
		// console.log('result:', result);
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0]; // 0-indexdagi qiymatni qaytaradi
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel.findByIdAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	// memberPropertiesni 1ga oshirib beradi
	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		const { _id, targetKey, modifier } = input;
		return await this.memberModel
			.findByIdAndUpdate(
				_id,
				{
					$inc: { [targetKey]: modifier }, //  operatori qiymatlarni o'zgartiradi, ularni qo'shadi yoki ayiradi.
				},
				{ new: true },
			)
			.exec();
	}
}
