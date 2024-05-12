import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable() // asosiy mantiqlar
export class MemberService { // Memberni inject qil
	constructor(@InjectModel('Member') private readonly memberModel: Model<null>) {} // memberModel schemani ulaymiz, Crud uchun

	public async signup(): Promise<string> {
		return 'signup executed!';
	}

	public async login(): Promise<string> {
		return 'login executed!';
	}

	public async updateMember(): Promise<string> {
		return 'updateMember executed!';
	}

	public async getMember(): Promise<string> {
		return 'getMember executed!';
	}
}
