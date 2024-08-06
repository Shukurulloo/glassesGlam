import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Properties, Property } from '../../libs/dto/property/property';
import { Direction, Message } from '../../libs/enums/common.enum';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	OrdinaryInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Member } from '../../libs/dto/member/member';
import { NotificationService } from '../notification/notification.service';
import { MemberStatus } from '../../libs/enums/member.enum';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private memberModel: Model<Member>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
		private notificationService: NotificationService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			// create bo'gani uchun try catchni  ishlatamz
			const result = await this.propertyModel.create(input); // result memberni qayataradi
			// increase memberProperties +1
			await this.memberService.memberStatsEditor({
				// dinamik
				_id: result.memberId,
				targetKey: 'memberProperties', // memberPropertiesni
				modifier: 1, // memberPropertiesni 1ga oshirib beradi
			});
			return result;
		} catch (err) {
			console.log('Error, service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED); // databace errorini o'rniga customized
		}
		// return 'createProperty executed';
	}

	public async getProperty(memberId: ObjectId, propertyId: ObjectId): Promise<Property> {
		const search: T = {
			//biz ko'rmoqchi bo'gan data
			_id: propertyId,
			propertyStatus: PropertyStatus.ACTIVE,
		};

		const targetProperty: Property = await this.propertyModel.findOne(search).lean().exec();
		if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			// agar authenticed bo'gan member bo'lsa
			const viewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY }; //view bo'ganini dalolat qiladigon logni hosl qilamz, // kimTomoshaQilishi.qaysiMemberniTomoshaQilishimz. uniTomoshaQiladi
			const newView = await this.viewService.recordView(viewInput); //yangi viewHoslQilamz
			if (newView) {
				// agar yangi view hosl bo'lsa quyida propertyni statistic datalarini yangilaydigon method hosl qildik
				await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
				targetProperty.propertyViews++; // lean orqali targetMemberni qiymatini oshiramz
			}

			// meLiked => shu propetyga biz like bosganmizmi? tekshiramz
			const likeInput = { memberId: memberId, likeRefId: propertyId, likeGroup: LikeGroup.PROPERTY };
			targetProperty.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}
		// targetProperty ni  memberDatasini hosl qildik
		targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
		return targetProperty;
	}

	public async updateProperty(memberId: ObjectId, input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt: deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			propertyStatus: PropertyStatus.ACTIVE,
		};

		if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.propertyModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			// u yoki bu bo'lsa -1
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async getProperties(memberId: ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = { propertyStatus: PropertyStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; //kelayotgan inputni ichidan sortni qabul qilamz, yani bo'lsa o'zi bo'lmsa createdAt obtional

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							// list orqali chiqaradi
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							//meLiked
							lookupAuthMemberLiked(memberId),
							lookupMember, // qidirsh
							{ $unwind: '$memberData' }, // memberDatani [] arraydan chiqarib olamz chunki (1ta)single dok bo'lgani uchun
						],
						metaCounter: [{ $count: 'total' }], // databacedagi umimiy property sonini beradi
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const { memberId, typeList, glassList, sizeList, colorList, periodsRange, pricesRange, options, text } =
			input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId); // agar matchni ichida id bo'lsa shape qilamz
		if (typeList && typeList.length) match.propertyType = { $in: typeList }; // agar matchni ichida propertyLocation
		if (glassList && glassList.length) match.propertyGlass = { $in: glassList }; // agar roomsList bo'lsa matchga briktramz
		if (sizeList && sizeList.length) match.propertySize = { $in: sizeList };
		if (colorList && colorList.length) match.propertyColor = { $in: colorList };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (pricesRange) match.propertyPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') }; // izlaganda bosh harfimi farqsz qidirsh
		if (options) {
			// u yoki bu qiymatlaridan kamida bittasi true bo'lgan hujjatlarni qidir.
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
		}
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		return await this.likeService.getFavoriteProperties(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		return await this.viewService.getVisitedProperties(memberId, input);
	}

	public async getAgentProperties(memberId: ObjectId, input: AgentPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if (propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST); // agar DELETE bo'lsa ololmaydi

		const match: T = {
			memberId: memberId,
			propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE }, // DELETE bo'lmagan
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember, //
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetProperty(memberId: ObjectId, likeRefId: ObjectId): Promise<Property> {
		const target: Property = await this.propertyModel
			.findOne({ _id: likeRefId, propertyStatus: PropertyStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);


		const AuthMember: Member = await this.memberModel
			.findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
			.exec();
		if (!AuthMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PROPERTY, // propertylarga like
		};

		const modifier: number = await this.likeService.toggleLike(input); //likeServiceni toggleLike methodi
		const result = await this.propertyStatsEditor({ _id: likeRefId, targetKey: 'propertyLikes', modifier: modifier }); // memberni static datasi yangilanadi

		const NotificInput = {
			notificationType: NotificationType.LIKE,
			notificationStatus: NotificationStatus.WAIT,
			notificationGroup: NotificationGroup.PROPERTY,
			notificationTitle: 'Like',
			notificationDesc: `${AuthMember.memberNick} Liked Vehicle `,
			authorId: memberId,
			receiverId: target.memberId,
		};

		await this.notificationService.createNotification(NotificInput);

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, typeList,glassList,sizeList,colorList } = input.search; // text search qilinsa
		const match: T = {}; 
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC }; //kelayotgan inputni ichidan sortni qabul qilamz, yani bo'lsa o'zi bo'lmsa createdAt obtional

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (typeList) match.propertyType = { $in: typeList };
		if (glassList) match.propertyGlass = { $in: glassList };
		if (sizeList) match.propertySize = { $in: sizeList };
		if (colorList) match.propertyColor = { $in: colorList };
		const result = await this.propertyModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0]; // 0-indexdagi qiymatni qaytaradi
	}

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			propertyStatus: PropertyStatus.ACTIVE,
		};

		if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.propertyModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: -1,
			});
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: ObjectId): Promise<Property> {
		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		const result = await this.propertyModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	//propertyni statistic datalarini yangilaydigon method hosl qildik
	public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
		// StatisticModifier bu collectionni ihtiyoriy dokni o'zgartrishda hizmatga keladigon interface
		const { _id, targetKey, modifier } = input;
		return await this.propertyModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}
}
