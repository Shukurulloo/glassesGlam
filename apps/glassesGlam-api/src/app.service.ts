import { Injectable } from '@nestjs/common';
/** service asosiy mantiqlar bajariladi */

@Injectable() // injection
export class AppService {
	getHello(): string {
		return 'Welcome to glassesGlam Rest API Server!';
	}
}
