import { Module } from '@nestjs/common';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';
import { AuthModule } from '../auth/auth.module';

@Module({ /** object sifatida schemani ulab olamz, AuthModuleniham ulaymiz */
	imports: [MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]), AuthModule],
	providers: [MemberResolver, MemberService], // MVC
})
export class MemberModule {}
