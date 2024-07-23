import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import PropertySchema from 'apps/glassesGlam-api/src/schemas/Property.model';
import MemberSchema from 'apps/glassesGlam-api/src/schemas/Member.model';

@Module({
	// ScheduleModule jobSchedulelarni ishga tushirib beradi
	imports: [
		ConfigModule.forRoot(), // forRoot bu .env ni o'qib beradi
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
