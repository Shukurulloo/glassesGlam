import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

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

	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Mutation: checkAuth');
		console.log('memberNick:', memberNick);
		return `Hi ${memberNick}`;
	}

	@Roles(MemberType.USER, MemberType.AGENT) // aynan USER qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Mutation: RolesGuard');
		return `Hi ${authMember.memberNick} You are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	// Authenticated bo'lgan userlar qila oldadi, user,agent, admin
	@UseGuards(AuthGuard) // auth bo'lgan bo'lsagina keyinga o'tkazadi, intersepteranham avval ishga tushadi
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId, // @AuthMember() custom decorator orqali authMember(login bo'gan user malumoti) qabul qilamz
	): Promise<Member> {
		console.log('Mutation: updateMember');
		delete input._id; // krib kegan inputni idsini o'chiramz o'rniga MemberUpdateni ichidagisini ishlatamz
		return this.memberService.updateMember(memberId, input);
	}

	@Query(() => Member)
	public async getMember(@Args('memberId') input: string): Promise<Member> {
		console.log('Query: getMember');
		const targetid = shapeIntoMongoObjectId(input);
		return this.memberService.getMember(targetid);
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN) // aynan admin qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
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
