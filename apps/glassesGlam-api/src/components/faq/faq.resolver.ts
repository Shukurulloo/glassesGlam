/* eslint-disable @typescript-eslint/no-unused-vars */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FaqDto, FaqsDto } from '../../libs/dto/faq/faq';
import { FaqInputDto, FaqInquiryDto } from '../../libs/dto/faq/faq.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { FaqService } from './faq.service';
import { FaqUpdateDto } from '../../libs/dto/faq/faq.update';

@Resolver()
export class FaqResolver {
	constructor(private readonly faqService: FaqService) {}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDto)
	public async createFaq(@Args('input') input: FaqInputDto, @AuthMember('_id') memberId: ObjectId): Promise<FaqDto> {
		console.log('Mutation: createFaq');
		console.log(input, '***************');

		const data = await this.faqService.createFaq(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDto)
	public async updateFaq(@Args('input') input: FaqUpdateDto, @AuthMember('_id') memberId: ObjectId): Promise<FaqDto> {
		console.log('Mutation: updateFaq');
		const data = await this.faqService.updateFaq(memberId, input);
		return data;
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => FaqDto)
	public async deleteFaq(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<FaqDto> {
		console.log('Mutation: deleteFaq');
		const faqId = shapeIntoMongoObjectId(input);
		const data = await this.faqService.deleteFaq(faqId);
		return data;
	}

	/** CLIENT **/

	@UseGuards(WithoutGuard)
	@Query((returns) => FaqDto)
	public async getFaq(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<FaqDto> {
		console.log('Query: getFaq');
		const faqId = shapeIntoMongoObjectId(input);
		const data = this.faqService.getFaq(faqId);

		return data;
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => FaqsDto)
	public async getFaqs(@Args('input') input: FaqInquiryDto, @AuthMember('_id') memberId: ObjectId): Promise<FaqsDto> {
		console.log('Query: getFaqs');

		const data = this.faqService.getFaqs(memberId, input);

		return data;
	}
}