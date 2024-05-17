import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from 'apps/nestar-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler()); // reflector orqli biz yuklagan rollarni chaqirdik
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;
			const bearerToken = request.headers.authorization; //tokenni qo'lga oldik
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST); // tekshrdik

			const token = bearerToken.split(' ')[1], // bearerTokenni bitta oraqli probel bilan split qilib 2-indexni qabul qildik u tokenni qolga olib beradi
				authMember = await this.authService.verifyToken(token), // tokenda user malumotlarini qabul qildik
				hasRole = () => roles.indexOf(authMember.memberType) > -1, // kerakli role ekanligini tekshradigon function
				hasPermission: boolean = hasRole(); // kerakli role bo'lsa true, false
			//agar admin user bo'lmasa err
			if (!authMember || !hasPermission) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

			console.log('memberNick[roles] =>', authMember.memberNick); // agar admin bo'lsa keyingi manqtiqqa o'tkazadi
			request.body.authMember = authMember;
			return true;
		}

		// description => http, rpc, gprs and etc are ignored
	}
}
