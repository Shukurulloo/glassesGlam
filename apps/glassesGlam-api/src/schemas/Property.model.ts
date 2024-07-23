import { Schema } from 'mongoose';
import { PropertyColor, PropertyGlass, PropertySize, PropertyStatus, PropertyType } from '../libs/enums/property.enum';

const PropertySchema = new Schema(
	{
		propertyType: {
			type: String,
			enum: PropertyType,
			required: true,
		},

		propertyStatus: {
			type: String,
			enum: PropertyStatus,
			default: PropertyStatus.ACTIVE,
		},

		propertyGlass: {
			type: String,
			enum: PropertyGlass,
			required: true,
		},

		propertySize: {
			type: String,
			enum: PropertySize,
			required: true,
		},

		propertyColor: {
			type: String,
			enum: PropertyColor,
			required: true,
		},

		propertyAddress: {
			type: String,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

	},
	{ timestamps: true, collection: 'properties' },
);
// compount index, yani 4ta malumot bir vaqtda unit bo'lishi kerak takror kiritilishini oldini olish
PropertySchema.index({ propertyType: 1, propertyGlass: 1, propertyTitle: 1, propertyPrice: 1, propertyColor: 1, }, { unique: true });

export default PropertySchema;
