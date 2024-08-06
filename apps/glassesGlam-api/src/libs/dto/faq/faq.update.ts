import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { FaqStatus, FaqType } from '../../enums/faq.enum';


@InputType()
export class FaqUpdateDto {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(10, 50)
	@Field(() => String, { nullable: true })
	faqQuestion: string;

	@IsOptional()
	@Length(10, 150)
	@Field(() => String, { nullable: true })
	faqAnswer: string;

	@IsOptional()
	@Field(() => FaqType, { nullable: true })
	faqType: FaqType;

	@IsOptional()
	@Field(() => FaqStatus, { nullable: true })
	faqStatus: FaqStatus;
}