import { Field, InputType, Int } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';

import { IsNotEmpty, Min, IsOptional, IsIn, Length } from 'class-validator';
import { FaqStatus, FaqType } from '../../enums/faq.enum';

@InputType()
export class FaqInputDto {
	@IsNotEmpty()
	@Length(8, 50)
	@Field(() => String)
	faqQuestion: string;

	@IsNotEmpty()
	@Length(10, 150)
	@Field(() => String)
	faqAnswer: string;

	@IsNotEmpty()
	@Field(() => FaqType)
	faqType: FaqType;

	@IsOptional()
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	memberId?: ObjectId;
}

@InputType()
export class FaqInquiryDto {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@IsIn(Object.values(FaqType))
	@Field(() => FaqType, { nullable: true })
	faqType?: FaqType;

	@IsOptional()
	@IsIn(Object.values(FaqStatus))
	@Field(() => FaqStatus, { nullable: true })
	faqStatus?: FaqStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}