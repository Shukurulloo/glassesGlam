import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';

@Injectable() // asosiy mantiqlar
export class MemberService {
	// Memberni inject qili, memberModel schemani ulaymiz, Crud uchun
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private authService: AuthService, // authServiceni qurib oldik
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword); // hash password
		try {
			// databace errori o'zgartrish uchun try catchni  ishlatamz
			const result = await this.memberModel.create(input);
			// TODO: Authentication via TOKEN
			return result;
		} catch (err) {
			console.log('Error, service.model:', err.message);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE); // databace errorini o'rniga customized
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberNick, memberPassword } = input; // yoyib olamz, destruction
		const response: Member = await this.memberModel
			.findOne({ memberNick: memberNick })
			.select('+memberPassword') //select memberPasswordni majburiy olib beradi, yangi usul
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			// agar response bo'lmasa yoki o'zini delete qilgan bo'lsa
			throw new InternalServerErrorException(Message.NO_MEMBER_NICK); // libsda bor
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			// va yana blok qilingan bo'lsa
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		// TODO: Compare passwords
		const isMatch = await this.authService.comparePasswords(input.memberPassword, response.memberPassword)
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		return response;
	}

	public async updateMember(): Promise<string> {
		return 'updateMember executed!';
	}

	public async getMember(): Promise<string> {
		return 'getMember executed!';
	}
}
