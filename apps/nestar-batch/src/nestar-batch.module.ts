import { Module } from '@nestjs/common';
import { NestarBatchController } from './nestar-batch.controller';
import { NestarBatchService } from './nestar-batch.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot()], // forRoot bu .env ni o'qib beradi
  controllers: [NestarBatchController],
  providers: [NestarBatchService],
})
export class NestarBatchModule {}
