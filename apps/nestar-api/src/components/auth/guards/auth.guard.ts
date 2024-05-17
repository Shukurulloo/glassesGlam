import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';
// (middleware?)
@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	// kirib kelayotgan requestni contexsini qo'lga olib beradigon mantiq
	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		console.info('--- @guard() Authentication [AuthGuard] ---');

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req; // shunday qilib krib kegan requestni qo'lga oldik

			const bearerToken = request.headers.authorization; // requestni headersidan authorizationni qabul qildik
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST); // agar bo'lmasa err

			const token = bearerToken.split(' ')[1], // bearerTokenni bitta oraqli probel bilan split qilib 2-indexni qabul qildik u tokenni qolga olib beradi
				authMember = await this.authService.verifyToken(token); // tokenda user malumotlarini qabul qildik
			if (!authMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			console.log('memberNick[auth] =>', authMember.memberNick); //kim murojat etishini ko'rsatamz
			request.body.authMember = authMember; // serverga kegan requestni body qismidan authMemberni briktrdik

			return true; // keyingi jarayonga o'tishini belgilayapmz
		}

		// description => http, rpc, gprs and etc are ignored
	}
}
