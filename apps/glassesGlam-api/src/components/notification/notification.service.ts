import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notifications, NotificDto } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { NotificationUpdate } from '../../libs/dto/notification/notification.update';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification')
		private readonly notificationModel: Model<NotificDto>,
	) {}

	public async createNotification(input: NotificationInput): Promise<NotificDto> {
		try {
			const result = await this.notificationModel.create(input);
			return result;
		} catch (err) {
			console.log('Error, Service.model', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getNotification(authorId: ObjectId, notificationId: ObjectId): Promise<NotificDto> {
		const search: T = {
			_id: notificationId,
		};

		const targetNotification: NotificDto = await this.notificationModel.findOne(search).lean().exec();
		if (!targetNotification) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return targetNotification;
	}

	public async updateNotification(authorId: ObjectId, input: NotificationUpdate): Promise<NotificDto> {
		const { _id } = input;
		const result = await this.notificationModel
			.findOneAndUpdate(
				{
					_id: _id,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { receiverId } = input.search;
		const match: T = { receiverId: memberId };
		const sort: T = { ['updatedAt']: input?.direction ?? Direction.DESC };

		console.log('match', match);

		const result = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}
}