import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() { // nest js expressni yutib oladi
  const app = await NestFactory.create(AppModule);//NestFactory ni ichida express bor, createni mahsuli expressga o'xshagan instance bo'ladi
  await app.listen(process.env.PORT_API ?? 3000); // appModulda configni ulab bu mantiqni bajardik
}
bootstrap();
