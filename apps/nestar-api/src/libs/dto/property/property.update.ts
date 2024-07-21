import { Field, InputType, Int } from '@nestjs/graphql';
import {  IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { PropertyColor, PropertyGlass, PropertySize, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { ObjectId } from 'mongoose';

// bu dto fayl krib kelayotgan data uchn  dto => data transfer object
@InputType()
export class PropertyUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => PropertyType, { nullable: true })
	propertyType?: PropertyType;

	@IsOptional()
	@Field(() => PropertyStatus, { nullable: true })
	propertyStatus?: PropertyStatus;

	@IsOptional()
	@Field(() => PropertyGlass, { nullable: true })
	propertyGlass?: PropertyGlass;

	@IsOptional()
	@Field(() => PropertySize, { nullable: true })
	propertySize?: PropertySize;

	@IsOptional()
	@Field(() => PropertyColor, { nullable: true })
	propertyColor?: PropertyColor;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	propertyTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	propertyPrice?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	propertyImages?: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	propertyDesc?: string;

	soldAt?: Date;

	deletedAt?: Date;
}
