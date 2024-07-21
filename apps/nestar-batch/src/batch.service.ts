import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/glassesGlam-api/src/libs/dto/member/member';
import { Property } from 'apps/glassesGlam-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from 'apps/glassesGlam-api/src/libs/enums/member.enum';
import { PropertyStatus } from 'apps/glassesGlam-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollBack(): Promise<void> {
		// eng avval ishlatilishi kerak bo'lgan mantiq
		await this.propertyModel
			.updateMany(
				// staticMethod
				{
					propertyStatus: PropertyStatus.ACTIVE, // 1-arg bu filter o'zgarishi kerak data
				},
				{ propertyRank: 0 }, // 2-arg bu aynan qaysi dataga o'zgarishi kerakligi, yani 0ga tengla
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProperties(): Promise<void> {
		const properties: Property[] = await this.propertyModel // active va rank 0 bo'lgan jami propertylarni qo'lga oldik
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();

		/** properties arrayini ustida map iteration methotini ishlatib har bir propertylarni qo'lga oldik va
          uni distraction qilib kerakli datalani olamz */
		const promisedList = properties.map(async (ele: Property) => {
			const { _id, propertyLikes, propertyViews } = ele;
			const rank = propertyLikes * 2 + propertyViews * 1; // qonuniyat orqali ranklarni hisoblab qo'lga olamz
			return await this.propertyModel.findByIdAndUpdate(_id, { propertyRank: rank }); //o'sha propertyga dahldor bo'gan rankini o'zgartiramz
		});
		await Promise.all(promisedList); //promisedList: pending object. ularni hammasini Promise.all orqali amalga oshiramz
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel // active agent va rank 0 bo'lgan jami memberlarni qo'lga oldik
			.find({
				memberType: MemberType.AGENT,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		/** agents arrayini ustida map iteration methotini ishlatib har bir memberlarni qo'lga oldik va
        uni distraction qilib kerakli datalani olamz */
		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberProperties, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberProperties * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1; // qonuniyat orqali ranklarni hisoblab qo'lga olamz
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank }); //o'sha propertyga dahldor bo'gan rankini o'zgartiramz
		});
		await Promise.all(promisedList); // hammasini Promise.all orqali amalga oshiramz
	}

	public getHello(): string {
		return 'Welcome to glassesGlam BATCH Server!';
	}
}
