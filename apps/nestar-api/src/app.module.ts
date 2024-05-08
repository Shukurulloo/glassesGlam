import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()], // forRoot bu .env variable ni o'qib beradi
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
