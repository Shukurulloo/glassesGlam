import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

// query => get,
// mutation => post
@Resolver() // boshqaruvchi
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {} // MemberService ni objectga aylantramz
// graphql API
	@Mutation(() => Member) // qaytaradigon qiymati Member dan iborat // chiqish validation
	@UsePipes(ValidationPipe) // to'g'ri data kirishini tekshiramz // kirish validation
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		// parametrda krib kelgan datani dto si aynan MemberInput bo'lshi shart deymiz
		try {
			console.log('Mutation: signup');
			return this.memberService.signup(input); // memberService objectiga
		} catch (err) {
			console.log('Error, signup:', err);
			throw new InternalServerErrorException(err); // bu 500 codli xatoni auto hosl qilib beradi
		}
	}

	@Mutation(() => Member)
	@UsePipes(ValidationPipe)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		try {
			console.log('Mutation: login');
			return this.memberService.login(input);
		} catch (err) {
			console.log('Error, login:', err);
			throw new InternalServerErrorException(err); // bu 500 codli xatoni auto hosl qilib beradi
		}
	}

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation: updateMember');
		return this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query: getMember');
		return this.memberService.getMember();
	}
}
