import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';
import { FaqService } from './faq.service';
import { FaqResolver } from './faq.resolver';
import FaqSchema from '../../schemas/Faq.modul';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Faq', schema: FaqSchema }]), MemberModule, AuthModule],
	providers: [FaqResolver, FaqService],
})
export class FaqModule {}