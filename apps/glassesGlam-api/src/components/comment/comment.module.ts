import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import CommentSchema from '../../schemas/Comment.model';
import { BoardArticleModule } from '../board-article/board-article.module';
import { PropertyModule } from '../property/property.module';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import PropertySchema from '../../schemas/Property.model';
import MemberSchema from '../../schemas/Member.model';
import BoardArticleSchema from '../../schemas/BoardArticle.model';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
		MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
		MongooseModule.forFeature([{ name: 'BoardArticle', schema: BoardArticleSchema }]),
		AuthModule,
		MemberModule,
		PropertyModule,
		BoardArticleModule,
		NotificationModule,
	],
	providers: [CommentResolver, CommentService],
	exports: [CommentService],
})
export class CommentModule {}