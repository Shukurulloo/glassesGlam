import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { Properties } from '../../libs/dto/property/property';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

// view hosl qilish mantig'i
@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {} // viewSchemaModelni qo'lga oldik

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
        if(!viewExist) { // agar view bo'lmasa(falseBo'lsa) yangi view hosl qilsin
            console.log("- New View Insert -")
            return await this.viewModel.create(input) //view Create
        } else return null
	}


    // bu mantiq: bir user ikkinchi bor ko'rsa view soni avval ko'rganda oshgani sabab yana oshmaydi
	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input; //distracrtion qilamz
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec(); //agar view bo'lsa view qaytaradi, bo'lmsa falseni qaytaradi
	}

	public async getVisitedProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input; // distractoin
		const match: T = { viewGroup: ViewGroup.PROPERTY, memberId: memberId }; // biz faqat property view larni olib beradi

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match }, // birinchi view loglar beradi
				{ $sort: { updatedAt: -1 } }, // eng oxirgi view birinchi chiqadi
				{
					$lookup: {
						from: 'properties',
						localField: 'viewRefId', // biz tomosha qilgan propertylarni Idsini viewRefId orqali qabul etamz
						foreignField: '_id', // properties collectionidan _id ga teng qiymatni izlaymiz
						as: 'visitedProperty',
					},
				},
				{ $unwind: '$visitedProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedProperty.memberData' }, // visitedProperty ni ichidagi memberdatani arraydan chiqar
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		// resultni ichidagi listni hosl qilinadi, datadagi 0-indexni qiymatlarni ichidagi listni map orqali itiratiion qilamz
		result.list = data[0].list.map((ele) => ele.visitedProperty); // har bir elementni qiymatidan foydalanib har bir elememnti visitedProperty qiymatini olib ber

		console.log('result:', result);
		return result;
	}
}
