import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { Model, ObjectId } from 'mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { Properties } from '../../libs/dto/property/property';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {} // likeschemamodulni injectqilamz

	/** TOGGLE(almashtirish)
		 	agar avval targetga like bosilgan bo'lsa toggle ishga tushib u likeni o'chirib natijani -1 qiladi 
		 	agar birinchi marta like bosilayotgan bo'lsa +1 qilib databacedagi collectionga like logini qo'shib beradi
		**/
	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			// avval like bosgan bo'lsak
			await this.likeModel.findOneAndDelete(search).exec(); //boslgan bo'lsa o'chiradi
			modifier = -1;
		} else {
			// avval like bosmagan bo'lsak
			try {
				//create: mongoose erroni qaytargani un
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error, service.model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`- Like modifier ${modifier} -`); // -1 yoki +1  ni ko'rish uchun
		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		// like bosilganlar
		const { memberId, likeRefId } = input; // distractoin
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		// aggregation formatda tashkillaymiz
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : []; // agar resultni qiymati mavjud bo'lsa arrayni ichi bu qiymatlani qaytar. menol: qo'lda qilish
	}

	public async getFavoriteProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input; // distractoin
		const match: T = { likeGroup: LikeGroup.PROPERTY, memberId: memberId }; // biz faqat property ga bosgan like larni olib beradi

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match }, // birinchi like loglar beradi
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'likeRefId', // biz like bosgan propertylarni Idsini likeRefId orqali qabul etamz
						foreignField: '_id', // properties collectionidan _id ga teng qiymatni izlaymiz
						as: 'favoriteProperty',
					},
				},
				{ $unwind: '$favoriteProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProperty.memberData' }, // favoriteProperty ni ichidagi memberdatani arraydan chiqar
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		// resultni ichidagi listni hosl qilinadi, datadagi 0-indexni qiymatlarni ichidagi listni map orqali itiratiion qilamz
		result.list = data[0].list.map((ele) => ele.favoriteProperty); // har bir elementni qiymatidan foydalanib har bir elememnti favoriteProperty qiymatini olib ber

		console.log('result:', result);
		return result;
	}
}
