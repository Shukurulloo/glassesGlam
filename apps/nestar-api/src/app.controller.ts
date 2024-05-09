import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController { // AppController rooterni o'ziga yutvoradi
  constructor(private readonly appService: AppService) {} // instance olamz

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
