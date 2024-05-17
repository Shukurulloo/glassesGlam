import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		HttpModule, // kelajakda ishlatsh mumkin
		// ro'yhatga olamz
		JwtModule.register({
			secret: `${process.env.SECRET_TOKEN}`, // secret codeni integratsiya qilamz
			signOptions: { expiresIn: '30d' },
		}),
	],
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {}
