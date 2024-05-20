import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';
// bu dto fayl krib kelayotgan data uchn  dto => data transfer object
@InputType() //typelarni yani dtolarni qurish un kerak bo'ladigon decoretor
export class MemberInput {
	@IsNotEmpty() // bo'sh bo'lmasligi kerak mantig'i
	@Length(3, 12) // memberni nicknamsi kamida 3ta ko'pida 12ta harfdan iborat bo'lsin tekshrish qonuniyati
	@Field(() => String) // String qiymat qaytarsin
	memberNick: string;

    @IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;

    @IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

    @IsOptional()
    @Field(() => MemberType, {nullable: true})  // nullable bo'sh bo'lishi mumkin
    memberType?: MemberType

    @IsOptional() // ihtiyoriy
    @Field(() => MemberAuthType, {nullable: true})  // nullable bo'sh bo'lishi mumkin
    memberAuthType?: MemberAuthType
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12) // memberni nicknamsi kamida 3ta ko'pida 12ta harfdan iborat bo'lsin tekshrish qonuniyati
	@Field(() => String) // String qiymat qaytarsin
	memberNick: string;

    @IsNotEmpty()
	@Length(5, 12)
	@Field(() => String)
	memberPassword: string;
}
