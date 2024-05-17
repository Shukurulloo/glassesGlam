import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
	public async hashPassword(memberPassword: string): Promise<string> {
		const salt = await bcrypt.genSalt(); // genSalt: hash uchun kk saltni oberadi
		return await bcrypt.hash(memberPassword, salt);
	}

	// login un. paramda pasword va hashed bo'gan pasword

	public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
		return await bcrypt.compare(password, hashedPassword); // compare async bogani un await qildik
	}
}
