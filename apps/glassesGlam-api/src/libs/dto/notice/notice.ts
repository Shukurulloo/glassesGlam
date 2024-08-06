import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { Member, TotalCounter } from '../member/member';
import { FaqType } from '../../enums/faq.enum';
import { NoticeStatus, NoticeType } from '../../enums/notice.enum';

@ObjectType()
export class NoticeDto {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	noticeType: NoticeType;

	@Field(() => String)
	noticeContent: string;

	@Field(() => NoticeStatus)
	noticeStatus: NoticeStatus;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date, { nullable: true })
	createdAt?: Date;

	@Field(() => Date, { nullable: true })
	updatedAt?: Date;
}

@ObjectType()
export class NoticesDto {
	@Field(() => [NoticeDto])
	list: NoticeDto[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}