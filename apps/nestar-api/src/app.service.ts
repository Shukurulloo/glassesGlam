import { Injectable } from '@nestjs/common';
/** service asosiy mantiqlar bajariladi */

@Injectable() // injection
export class AppService {
  getHello(): string {
    return 'Welcome to Nestar Rest API Server!';
  }
}
