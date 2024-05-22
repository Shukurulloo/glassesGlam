import { Args, Mutation, Resolver, Query, } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import { PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	@Roles(MemberType.AGENT) // aynan AGENT qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async createProperty(
		@Args('input') input: PropertyInput,
		@AuthMember('_id') memberId: ObjectId, // authserviceda stringdan objectga wrap qilgan edik
	): Promise<Property> {
		console.log('Mutation: createProperty');
		input.memberId = memberId;
		//kirib kelayotkan inputni MemberId siga request qilayotkan agent memberId sini  @AuthMember orqali olib beryapmiz.
		// Chunki bu frontend dan kelmaydi deb property.inputda korsatkanmiz
		return await this.propertyService.createProperty(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Property)
	public async getProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Query: getProperty');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.getProperty(memberId, propertyId);
	}


	@Roles(MemberType.AGENT) // aynan AGENT qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Mutation((returns) => Property)
	public async updateProperty(
		@Args('input') input: PropertyUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Mutation: updateProperty');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updateProperty(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId
	): Promise<Properties> {
		console.log('Query: getProperties');
		return await this.propertyService.getProperties(memberId, input);
	}
}
