import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {} //JwtService clasi orqali jwtService objectini hosil qilamz

	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt(); // genSalt: hash uchun kk saltni oberadi
		return await bcrypt.hash(memberPassword, salt);
	}

	// login un. paramda pasword va hashed bo'gan pasword

	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword); // compare async bogani un await qildik
	}

	// memberni qiymatidan jwtni hosl qilamz , asyncni sababi payloadni hosl qilamz
	public async createToken(member: Member): Promise<string> {
		const payload: T = {}; // payloadni ishlatib jwtni hosl qilamz

		/** Object clasini keyslarni olib beradigon keys methodiga shart yozamz
            member doim o'zi kemasligi mumkin _doc ichida ham kelishi mumkin
            agar _doc ichida qiymat mavjud bo'lsa o'sha qiymatni bersin aks holda memberni bersin
         */
		Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
			payload[`${ele}`] = member[`${ele}`]; // har bir keyning qiymatini payload obyektiga ko'chirib beradi
		});
		delete payload.memberPassword; // memberPasswordni o'chiramz

		return await this.jwtService.signAsync(payload); //tokenni hosl qilamz
	}

	// tokenni ichida keladigon datani chiqarib beradigon mantiq yani kim murojat qilishi
	public async verifyToken(token: string): Promise<Member> {
		const member = await this.jwtService.verifyAsync(token); // memberni qiyamtini olib beradi
		return member;
	}
}
