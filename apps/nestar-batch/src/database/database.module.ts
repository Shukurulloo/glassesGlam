import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose'; // type interface

@Module({
	imports: [
		MongooseModule.forRootAsync({// obtionni argument qib pass qildi
			useFactory: () => ({
				uri: process.env.NODE_ENV === 'production' ? process.env.MONGO_PROD : process.env.MONGO_DEV,
			}), // agar NODE_ENV ni qiymati production bo'lsa MONGO_PROD linkini uri ga tenglaymiz aks holda MONGO_DEV linkini qabul qilsin
		}),
	],
	exports: [MongooseModule], // shu configurate qilganni export qilamz
})
export class DatabaseModule { // aynan qaysi databasega ulanganini print qiladigon mantiq
	constructor(@InjectConnection() private readonly connection: Connection) {
		if (connection.readyState === 1) { // agar connection ni readyState si 1ga teng bo'lsa log chiqadi yani muaffaqiyatli ulangan bo'ladi
			console.log(
				`MongoDB is connected into ${process.env.NODE_ENV === 'production' ? 'production' : 'development'} db`, // 2ta linkdan biriga teng bo'lsa o'shanga ulanganini ko'rsatadi
			);
		} else {  // aks holda error
			console.log('DB is not connected!');
		}
	}
}