import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

// nest js expressni yutib oladi
async function bootstrap() {
	const app = await NestFactory.create(AppModule); //NestFactory ni ichida express bor, createni mahsuli expressga o'xshagan instance bo'ladi
	app.useGlobalPipes(new ValidationPipe()); // validation pipe ni global tarzda integratsia qildik
  app.useGlobalInterceptors(new LoggingInterceptor()) // request va responselarni log qilib beradi
	await app.listen(process.env.PORT_API ?? 3000); // appModulda configni ulab bu mantiqni bajardik
}
bootstrap();
