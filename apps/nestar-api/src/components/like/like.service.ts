import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from '../../libs/dto/like/like';
import { Model } from 'mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			// avval like bosgan bo'lsak
			await this.likeModel.findOneAndDelete(search).exec(); //boslgan bo'lsa o'chiradi
			modifier = -1;
		} else {
			// avval like bosmagan bo'lsak
			try {
				//create: mongoose erroni qaytargani un
				await this.likeModel.create(input);
			} catch (err) {
                console.log('Error, service.model:', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`- Like modifier ${modifier} -`);
		return modifier;
	}
}
