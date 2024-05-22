import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { PropertyLocation, PropertyStatus, PropertyType } from '../../enums/property.enum';
// bu fayl backentdan clientga to'g'ri data chiqishi dto si

@ObjectType() // bu serverdan clientga yuborilayotganda typelarni yani dtolarni qurish un kerak bo'ladigon decoretor
export class Property {
	@Field(() => String) // graphql uchun type
	_id: ObjectId; // typescript uchun type

	@Field(() => PropertyType)
	propertyType: PropertyType;

	@Field(() => PropertyStatus)
	propertyStatus: PropertyType;

	@Field(() => PropertyLocation)
	propertyLocation: PropertyLocation;

	@Field(() => String)
	propertyAddress: string;

	@Field(() => String)
	propertyTitle: string;

	@Field(() => Number)
	propertyPrice: number;

	@Field(() => Number)
	propertySquare: number;

	@Field(() => Int)
	propertyBeds: string;

	@Field(() => Int)
	propertyRooms: string;

	@Field(() => Int)
	propertyViews: string;

	@Field(() => Int)
	propertyLikes: string;

	@Field(() => Int)
	propertyComments: string;

	@Field(() => Int)
	propertyRank: string;

	@Field(() => [String])
	propertyImages: string[];

	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	@Field(() => Boolean)
	propertyBarter: boolean;

	@Field(() => Boolean)
	propertyRent: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	// field => bu graphql uchun type registratsiyasi
	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
