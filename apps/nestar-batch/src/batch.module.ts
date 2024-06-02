import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({ // ScheduleModule jobSchedulelarni ishga tushirib beradi
	imports: [ConfigModule.forRoot(), DatabaseModule, ScheduleModule.forRoot()], // forRoot bu .env ni o'qib beradi
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
