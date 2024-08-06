import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { LikeModule } from '../like/like.module';
import { FollowModule } from '../follow/follow.module';
import FollowSchema from '../../schemas/Follow.model';
import { NotificationModule } from '../notification/notification.module';
import NotificationSchema from '../../schemas/Notification.model';
import MemberModel from '../../schemas/Member.model';
import { PropertyModule } from '../property/property.module';
import { BoardArticleModule } from '../board-article/board-article.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),

		AuthModule,
		ViewModule,
		LikeModule,
		NotificationModule,
		// BoardArticleModule,
	],

	providers: [MemberResolver, MemberService],
	exports: [MemberService],
})
export class MemberModule {}