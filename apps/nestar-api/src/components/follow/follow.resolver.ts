import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Follower, Followers, Followings } from '../../libs/dto/follow/follow';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FollowResolver {
	constructor(private readonly followService: FollowService) {}

	@UseGuards(AuthGuard) // auth bo'lgan bo'lsagina keyinga o'tkazadi, intersepteranham avval ishga tushadi
	@Mutation((returns) => Follower)
	public async subscribe(
		@Args('input') input: string, // kimga obuna bo'lishimz
		@AuthMember('_id') memberId: ObjectId, // @AuthMember() custom decorator orqali authMember(login bo'gan user malumoti) qabul qilamz
	): Promise<Follower> {
		console.log('Mutation: subscribe');
		const followingId = shapeIntoMongoObjectId(input);

		return await this.followService.subscribe(memberId, followingId);
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => Follower)
	public async unsubscribe(
		@Args('input') input: string, // kimga obunani olishmz
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Follower> {
		console.log('Mutation: unsubscribe');
		const followingId = shapeIntoMongoObjectId(input);

		return await this.followService.unsubscribe(memberId, followingId);
	}

	@UseGuards(WithoutGuard) // authorisation
	@Query((returns) => Followings)
	public async getMemberFollowings(  // biz subscribe bo'lganlar
		@Args('input') input: FollowInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Followings> {
		console.log('Query: getMemberFollowings');
		const { followerId } = input.search; // faqat followerId qiymati talab qilinadi// biz followingini ko'rmoqchi bo'gan member
		input.search.followerId = shapeIntoMongoObjectId(followerId);
		return await this.followService.getMemberFollowings(memberId, input);
	}

    @UseGuards(WithoutGuard) // authorisation
	@Query((returns) => Followers)
	public async getMemberFollowers( // bizga subscribe bo'lganlar
		@Args('input') input: FollowInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Followers> {
		console.log('Query: getMemberFollowers');
		const { followingId } = input.search; // faqat followingId qiymati talab qilinadi
		input.search.followingId = shapeIntoMongoObjectId(followingId);
		return await this.followService.getMemberFollowers(memberId, input);
	}
}

// AUTH => DAVID
// FOLLOWERID => MARTIN
// FOLLOWING => SHAWN