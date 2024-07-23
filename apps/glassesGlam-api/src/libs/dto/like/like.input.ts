import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ObjectId } from 'mongoose';
import { LikeGroup } from '../../enums/like.enum';

@InputType()
export class LikeInput {
	@IsNotEmpty()
	@Field(() => String)
	memberId: ObjectId;// like ni kim bosayotgani idsi

	@IsNotEmpty()
	@Field(() => String)
	likeRefId: ObjectId; // qaysi targetga like bosilgani

	@IsNotEmpty()
	@Field(() => LikeGroup)
	likeGroup: LikeGroup; // qaysi turdagi targetga
}
