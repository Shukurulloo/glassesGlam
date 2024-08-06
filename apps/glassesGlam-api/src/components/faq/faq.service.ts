import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { FaqDto, FaqsDto } from '../../libs/dto/faq/faq';
import { FaqInputDto, FaqInquiryDto } from '../../libs/dto/faq/faq.input';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { FaqUpdateDto } from '../../libs/dto/faq/faq.update';

@Injectable()
export class FaqService {
	constructor(@InjectModel('Faq') private readonly faqModel: Model<FaqDto>) {}

	public async createFaq(memberId: ObjectId, input: FaqInputDto): Promise<FaqDto> {
		input.memberId = memberId;

		const result: FaqDto = await this.faqModel.create(input);

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

		return result;
	}

	public async updateFaq(memberId: ObjectId, input: FaqUpdateDto): Promise<FaqDto> {
		console.log(input, 'FAQ INPUT');

		const result: FaqDto = await this.faqModel
			.findOneAndUpdate({ _id: input._id, memberId: memberId }, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async deleteFaq(faqId: ObjectId): Promise<FaqDto> {
		const result: FaqDto = await this.faqModel.findOneAndDelete(faqId).exec();

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async getFaq(faqId: ObjectId): Promise<FaqDto> {
		const result: FaqDto = await this.faqModel.findOne(faqId).exec();

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result;
	}

	public async getFaqs(memberId: ObjectId, input: FaqInquiryDto): Promise<FaqsDto> {
		const { faqType, faqStatus, text } = input;
		const match: T = {};
		if (faqType) {
			match.faqType = faqType;
		}
		if (faqStatus) {
			match.faqStatus = faqStatus;
		}
		if (text) {
			// match.faqAnswer = { $regex: new RegExp(text, 'i') };
			match.faqQuestion = { $regex: new RegExp(text, 'i') };
		}

		const sort: T = { ['createdAt']: -1 };
		const result = await this.faqModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result || !result[0]) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const faqsResult = result[0];

		const faqsDto: FaqsDto = {
			list: faqsResult.list.map((item: FaqDto) => ({
				_id: item._id,
				faqQuestion: item.faqQuestion,
				faqAnswer: item.faqAnswer,
				faqType: item.faqType,
				faqStatus: item.faqStatus,
				memberData: item.memberData,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			metaCounter: faqsResult.metaCounter,
		};

		return faqsDto;
	}
}