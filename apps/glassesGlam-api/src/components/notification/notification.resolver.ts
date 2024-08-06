/* eslint-disable @typescript-eslint/no-unused-vars */
import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { WithoutGuard } from '../auth/guards/without.guard';
import { NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { Notifications, NotificDto } from '../../libs/dto/notification/notification';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(WithoutGuard)
	@Query((returns) => NotificDto)
	public async getNofication(
		@Args('notificationId') input: string,
		@AuthMember('_id') authorId: ObjectId,
	): Promise<NotificDto> {
		console.log('Query: getNotification');
		const notificationId = shapeIntoMongoObjectId(input);

		return await this.notificationService.getNotification(authorId, notificationId);
	}

	@UseGuards(WithoutGuard)
	@Mutation((returns) => NotificDto)
	public async updateNotification(
		@Args('input') input: NotificationUpdate,
		@AuthMember('_id') authorId: ObjectId,
	): Promise<NotificDto> {
		console.log('Mutation:updateNotification');
		input._id = shapeIntoMongoObjectId(input._id);

		return await this.notificationService.updateNotification(authorId, input);
	}
	@UseGuards(WithoutGuard)
	@Query((returns) => Notifications)
	public async getNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		console.log('Query:getNotifications');
		console.log('input:', input);
		return await this.notificationService.getNotifications(memberId, input);
	}
}