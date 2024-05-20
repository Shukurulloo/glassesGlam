import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';
// bu fayl backentdan clientga to'g'ri data chiqishi dto si

@ObjectType() // bu serverdan clientga yuborilayotganda typelarni yani dtolarni qurish un kerak bo'ladigon decoretor
export class View {
	@Field(() => String) // graphql uchun type
	_id: ObjectId; // typescript uchun type

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	viewRefId: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
