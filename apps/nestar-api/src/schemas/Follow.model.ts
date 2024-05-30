import { Schema } from 'mongoose';

const FollowSchema = new Schema(
	{
		followingId: {
			type: Schema.Types.ObjectId,
			required: true,
		},

		followerId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
	},
	{ timestamps: true, collection: 'follows' },
);

FollowSchema.index({ followingId: 1, followerId: 1 }, { unique: true }); // faqat birmarta subscribe bola oladi degan uniq shart

export default FollowSchema;
