import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NoticeService } from './notice.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NoticeInputDto, NoticeInquiryDto } from '../../libs/dto/notice/notice.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { NoticeDto, NoticesDto } from '../../libs/dto/notice/notice';
import { NoticeUpdateDto } from '../../libs/dto/notice/notice.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class NoticeResolver {
	constructor(private readonly noticeService: NoticeService) {}

	/** ADMIN **/
	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => NoticeDto)
	public async createNotice(
		@Args('input') input: NoticeInputDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<NoticeDto> {
		console.log('Mutation: createNotice');
		input.memberId = memberId;
		const data = await this.noticeService.createNotice(input);
		return data;
	}

	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => NoticeDto)
	public async updateNotice(
		@Args('input') input: NoticeUpdateDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<NoticeDto> {
		console.log('Mutation: updateNotice');
		const data = await this.noticeService.updateNotice(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => NoticeDto)
	public async deleteNotice(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<NoticeDto> {
		console.log('Mutation: deleteNotice');
		const noticeId = shapeIntoMongoObjectId(input);
		const data = await this.noticeService.deleteNotice(noticeId);
		return data;
	}

	/** CLIENT **/

	@UseGuards(WithoutGuard)
	@Query((returns) => NoticeDto)
	public async getNotice(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<NoticeDto> {
		console.log('Query: getNotice');
		const noticeId = shapeIntoMongoObjectId(input);
		const data = this.noticeService.getNotice(noticeId);

		return data;
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => NoticesDto)
	public async getNotices(
		@Args('input') input: NoticeInquiryDto,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<NoticesDto> {
		console.log('Query: getNotices');
		console.log(input, 'GET NOTICES');

		const data = this.noticeService.getNotices(memberId, input);

		return data;
	}
}