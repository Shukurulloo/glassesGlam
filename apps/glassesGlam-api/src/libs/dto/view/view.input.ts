import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { ViewGroup } from '../../enums/view.enum';
import { ObjectId } from 'mongoose';

// bu dto fayl krib kelayotgan data uchn  dto => data transfer object
@InputType() //typelarni yani dtolarni qurish un kerak bo'ladigon decoretor
export class ViewInput {
	@IsNotEmpty() // bo'sh bo'lmasligi kerak mantig'i
	@Field(() => String)
	memberId: ObjectId;

	@IsNotEmpty()
	@Field(() => String)
	viewRefId: ObjectId;

	@IsNotEmpty()
	@Field(() => ViewGroup)
	viewGroup: ViewGroup;  // 'MEMBER','ARTICLE','PROPERTY lar uchun
}
