import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Direction } from '../../enums/common.enum';

@InputType()
export class NotificationInput {
	@IsNotEmpty()
	@IsEnum(NotificationType)
	notificationType: NotificationType;

	@IsOptional()
	@IsEnum(NotificationStatus)
	notificationStatus: NotificationStatus;

	@IsNotEmpty()
	@IsEnum(NotificationGroup)
	notificationGroup: NotificationGroup;

	@IsNotEmpty()
	@IsString()
	notificationTitle: string;

	@IsOptional()
	@IsString()
	notificationDesc: string;

	authorId: ObjectId;

	receiverId: ObjectId;

	propertyId?: ObjectId;

	articleId?: ObjectId;
}

@InputType()
class NISearch {
	@Field(() => String, { nullable: true })
	receiverId?: string;
}
@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsOptional()
	@Field(() => NISearch, { nullable: true })
	search?: NISearch;
}