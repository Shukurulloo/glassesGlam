import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { availableAgentSorts, availableMemberSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

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
	@Field(() => MemberType, { nullable: true }) // nullable bo'sh bo'lishi mumkin
	memberType?: MemberType;

	@IsOptional() // ihtiyoriy
	@Field(() => MemberAuthType, { nullable: true }) // nullable bo'sh bo'lishi mumkin
	memberAuthType?: MemberAuthType;
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


/** Agents **/
@InputType()
class AISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; // search qilayotgan vaqti agentlarni nomlari orqaliham topishmz mumkin
}

@InputType()
export class AgentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // pagenation

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // har pageda nechtadan agent bo'lishi kerakligi

	@IsOptional()
	@IsIn(availableAgentSorts) // IsIn [] ichida bo'lgan qiymatlarnigina qabul qiladi degani
	@Field(() => String, { nullable: true })
	sort?: string; // sorting

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga yoki aksi bo'gan filterlar uchun ishlatamz yani eng avval qo'shilgan yoki aksi

	@IsNotEmpty()
	@Field(() => AISearch)
	search: AISearch;
}


/**  AllMembers **/


@InputType() //qolip
class MISearch {
	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string; // search qilayotgan vaqti agentlarni nomlari orqaliham topishmz mumkin
}

@InputType()
export class MembersInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number; // pagenation

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number; // har pageda nechtadan agent bo'lishi kerakligi

	@IsOptional()
	@IsIn(availableMemberSorts) // IsIn [] ichida bo'lgan qiymatlarnigina qabul qiladi degani
	@Field(() => String, { nullable: true })
	sort?: string; // sorting

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction; // yuqoridan pastga yoki aksi bo'gan filterlar uchun ishlatamz yani eng avval qo'shilgan yoki aksi

	@IsNotEmpty() // bo'lishi shart
	@Field(() => MISearch)
	search: MISearch;
}
