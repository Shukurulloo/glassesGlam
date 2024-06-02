import { Module } from '@nestjs/common'; // @nestjs/common packageda modulni to'liq futuresini qurib beradi ularni classga ko'chiramz
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; // nestjs/config bu package
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { AppResolver } from './app.resolver';
import { ComponentsModule } from './components/components.module';
import { DatabaseModule } from './database/database.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';

/** AOP ni asosiy bo'lagi modul hisoblanadi
 Module decorator ichidagilar metadeta, metadeta esa hususiyati, detani tarifi, imkoniyatlar
 */
@Module({
	// import, controllers, providers lar  module decoretorni propertylari hisoblanadi
	imports: [
		// moshqa modullar kirib keladi pass qiliniadi
		ConfigModule.forRoot(), // forRoot bu .env variable ni o'qib beradi
		GraphQLModule.forRoot({
			driver: ApolloDriver, // driver: GraphQL server adapteri  // ApolloDriver bu adabter
			playgroud: true, // GraphQL Playground interfeysini faol qiladi yoki o'chiradi. browserda mashq qilish mumkin
			uploads: false, // client fayl yuklashini o'chiradi qiladi
			autoSchemaFile: true, //Agar true bo'lsa, GraphQL sxemasi avtomatik ravishda yaratiladi
			// resolverda hosil bo'lgan errorni qabul qilib customized qilib frontendga yubordik
			formatError: (error: T) => {
				// errorni bir formatga keltramz
				const graphQLFormattedError = {
					code: error?.extensions.code, // extensionsni ichidagi codni qabul qilamz
					// 3 turdagi error messageni qolga kiritdik, server, pipe, umumiy errorlar
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
				};
				console.log('GRAPHQL GLOBAL ERR:', graphQLFormattedError);
				return graphQLFormattedError; // server qotib qolmasligi uchun
			},
		}),
		ComponentsModule, // faqat modullarni jamlab beradi
		DatabaseModule,
		SocketModule,
	],
	controllers: [AppController],
	providers: [AppService, AppResolver], //providersdagi hamma narsalar Injectable bo'ladi
})
export class AppModule {}
