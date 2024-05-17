import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

// query => get,
// mutation => post
@Resolver() // boshqaruvchi
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {} // MemberService ni objectga aylantramz
	// graphql API
	@Mutation(() => Member) // qaytaradigon qiymati Member dan iborat // chiqish validation
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		// parametrda krib kelgan datani dto si aynan MemberInput bo'lshi shart deymiz
		console.log('Mutation: signup');
		return this.memberService.signup(input); // memberService objectiga
	}

	@Mutation(() => Member) // @Args => param decorator
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		return this.memberService.login(input);
	}

	// Authenticated bo'lgan userlar qila oldadi, user,agent, admin
	@UseGuards(AuthGuard) // auth bo'lgan bo'lsagina keyinga o'tkazadi, intersepteranham avval ishga tushadi
	@Mutation(() => String)
	public async updateMember(@AuthMember('_id') memberId: ObjectId): Promise<string> {
		// @AuthMember() custom decorator orqali authMember(login bo'gan user malumoti) qabul qilamz
		console.log('Mutation: updateMember');
		return this.memberService.updateMember();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Mutation: checkAuth');
		console.log("memberNick:", memberNick);

		return `Hi ${memberNick}`;
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		return this.memberService.getAllMembersByAdmin();
	}

	// Authorization: ADMIN
	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation: updateMemberByAdmin');
		return this.memberService.updateMemberByAdmin();
	}
}
