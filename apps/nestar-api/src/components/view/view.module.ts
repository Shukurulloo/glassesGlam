import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { MongooseModule } from '@nestjs/mongoose';
import ViewSchema from '../../schemas/View.model';

@Module({
	// forFeature bu viewSchemaModulni hosl qilib, viewModulni ichiga import qiberadi
	imports: [MongooseModule.forFeature([{ name: 'View', schema: ViewSchema }])],
	providers: [ViewService],
  exports: [ViewService],
})
export class ViewModule {}
