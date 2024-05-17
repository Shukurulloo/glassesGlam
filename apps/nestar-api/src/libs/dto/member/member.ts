import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
// bu fayl backentdan clientga to'g'ri data chiqishi dto si

@ObjectType() // bu serverdan clientga yuborilayotganda typelarni yani dtolarni qurish un kerak bo'ladigon decoretor
export class Member {
	@Field(() => String) // graphql uchun type
	_id: ObjectId; // typescript uchun type

	// field => bu graphql uchun type registratsiyasi
	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberNick: string;

	memberPassword?: string; //graphqlga tanishtrmadik va graphql clientga bu malumotni chiqarib bermaydi

	@Field(() => String, { nullable: true }) //  nullable bo'lmasligiham mumkin degani
	memberFullName?: string;

	@Field(() => String)
	memberImage: string;

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@Field(() => Int)
	memberProperties: number;

	@Field(() => Int)
	memberArticles: number;

	@Field(() => Int)
	memberFollowers: number;

	@Field(() => Int)
	memberFollowings: number;

	@Field(() => Int)
	memberPoints: number;

	@Field(() => Int)
	memberLikes: number;

	@Field(() => Int)
	memberViews: number;

	@Field(() => Int)
	memberComments: number;

	@Field(() => Int)
	memberRank: number;

	@Field(() => Int)
	memberWarnings: number;

	@Field(() => Int)
	memberBlocks: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// accessToken uchun
	@Field(() => String, { nullable: true }) // bu signup yoki login bo'gandagina hosl bo'ladi shuning uchun nullable yozamz
	accessToken?: string;
}
