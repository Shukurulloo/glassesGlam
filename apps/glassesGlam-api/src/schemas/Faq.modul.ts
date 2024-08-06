import { Schema } from 'mongoose';
import { FaqStatus, FaqType } from '../libs/enums/faq.enum';

const FaqSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		faqQuestion: {
			type: String,
			required: true,
		},
		faqAnswer: {
			type: String,
			required: true,
		},
		faqType: {
			type: String,
			enum: FaqType,
			default: FaqType.PRODUCTS,
		},
		faqStatus: {
			type: String,
			enum: FaqStatus,
			default: FaqStatus.ACTIVE,
		},
	},
	{ timestamps: true, collection: 'faqs' },
);

export default FaqSchema;