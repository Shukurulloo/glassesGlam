import { Module } from '@nestjs/common'; // @nestjs/common packageda modulni to'liq futuresini qurib beradi ularni classga ko'chiramz
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // nestjs/config bu package
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';

/** AOP ni asosiy bo'lagi modul hisoblanadi
 Module decorator ichidagilar metadeta, metadeta esa hususiyati, detani tarifi, imkoniyatlar
 */
@Module({ 				// import, controllers, providers lar  module decoretorni propertylari hisoblanadi
	imports: [ 					// moshqa modullar kirib keladi pass qiliniadi
		ConfigModule.forRoot(), 			// forRoot bu .env variable ni o'qib beradi
		GraphQLModule.forRoot({ 			// GraphQLModule
			driver: ApolloDriver, 		// driver: GraphQL server adapteri  // ApolloDriver bu adabter
			playgroud: true,			 // GraphQL Playground interfeysini faol qiladi yoki o'chiradi. browserda mashq qilish mumkin
			uploads: false, 			// client fayl yuklashini o'chiradi qiladi
			autoSchemaFile: true, 			//Agar true bo'lsa, GraphQL sxemasi avtomatik ravishda yaratiladi
		}),
		ComponentsModule, // faqat modullarni jamlab beradi
		DatabaseModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver], 			//providersdagi hamma narsalar Injectable bo'ladi
})
export class AppModule {}
