import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';

@Module({
	imports: [
		ConfigModule.forRoot(), // forRoot bu .env variable ni o'qib beradi
		GraphQLModule.forRoot({
			driver: ApolloDriver,   // driver: GraphQL server adapteri
			playgroud: true,        // yGraphQL Playground interfeysini faol qiladi yoki o'chiradi. browserda mashq qilish mumkin
			uploads: false,        // client fayl yuklashini o'chiradi qiladi
			autoSchemaFile: true,   //Agar true bo'lsa, GraphQL sxemasi avtomatik ravishda yaratiladi
		}),
	], 
	controllers: [AppController],
	providers: [AppService, AppResolver],
})
export class AppModule {}
