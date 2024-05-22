import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload'; // serverga yuklanayotgan datalarga limit qo'yish un kerak
import * as express from 'express';

// nest js expressni yutib oladi
async function bootstrap() {
	const app = await NestFactory.create(AppModule); //NestFactory ni ichida express bor, createni mahsuli expressga o'xshagan instance bo'ladi
	app.useGlobalPipes(new ValidationPipe()); // validation pipe ni global tarzda integratsia qildik
	app.useGlobalInterceptors(new LoggingInterceptor()); // request va responselarni log qilib beradi
	/** Upload */
	app.enableCors({ origin: true, credentials: true }); // ihtiyoriy domen requestlarni serverimz qabul etishiga ruhsat beramz
	app.use(graphqlUploadExpress({ maxFileSize: 15000000, maxFiles: 10 })); // 15mgb gacha, 10tagacha bo'sin
	app.use('/uploads', express.static('./uploads')); // shu folderni tashqariga static folder qilb ochamz

	await app.listen(process.env.PORT_API ?? 3000); // appModulda configni ulab bu mantiqni bajardik
}
bootstrap();