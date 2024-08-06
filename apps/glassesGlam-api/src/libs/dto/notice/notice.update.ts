import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';

@InputType()
export class NoticeUpdateDto {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Length(10, 150)
	@Field(() => String, { nullable: true })
	noticeContent?: string;

	@IsOptional()
	@Field(() => NoticeType, { nullable: true })
	noticeType?: NoticeType;

	@IsOptional()
	@Field(() => NoticeStatus, { nullable: true })
	noticeStatus?: NoticeStatus;
}