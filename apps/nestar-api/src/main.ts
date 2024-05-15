import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// nest js expressni yutib oladi
async function bootstrap() {
	const app = await NestFactory.create(AppModule); //NestFactory ni ichida express bor, createni mahsuli expressga o'xshagan instance bo'ladi
	app.useGlobalPipes(new ValidationPipe()); // validation pipe ni global tarzda integratsia qildik
	await app.listen(process.env.PORT_API ?? 3000); // appModulda configni ulab bu mantiqni bajardik
}
bootstrap();
