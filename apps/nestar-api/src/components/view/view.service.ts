import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';

// view hosl qilish mantig'i
@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {} // viewModelni qo'lga oldik

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
        if(!viewExist) { // agar view bo'lmasa(falseBo'lsa) yangi view hosl qilsin
            console.log("- New View Insert -")
            return await this.viewModel.create(input) //view Create
        } else return null
	}


    // bu mantiq: bir user ikkinchi bor ko'rsa view soni avval ko'rganda oshgani sabab yana oshmaydi
	private async checkViewExistence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input; //distracrtion qilamz
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec(); //agar view bo'lsa view qaytaradi, bo'lmsa falseni qaytaradi
	}
}
