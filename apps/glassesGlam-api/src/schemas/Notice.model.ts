import mongoose, { Schema } from 'mongoose';
import { NoticeCategory, NoticeStatus, NoticeType } from '../libs/enums/notice.enum';

const NoticeSchema = new Schema(
	{
		noticeType: {
			type: String,
			enum: NoticeType,
			required: true,
		},

		noticeStatus: {
			type: String,
			enum: NoticeStatus,
			default: NoticeStatus.ACTIVE,
		},

		noticeContent: {
			type: String,
			required: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'notices' },
);

export default NoticeSchema;