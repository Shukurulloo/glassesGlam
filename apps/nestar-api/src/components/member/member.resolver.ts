import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForImage, shapeIntoMongoObjectId, validMimeTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';

// query => get,
// mutation => post
@Resolver() // boshqaruvchi
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {} // MemberService ni objectga aylantramz
	// graphql API
	@Mutation(() => Member) // qaytaradigon qiymati Member dan iborat // chiqish validation
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		// parametrda krib kelgan datani dto si aynan MemberInput bo'lshi shart deymiz
		console.log('Mutation: signup');
		return await this.memberService.signup(input); // memberService objectiga
	}

	@Mutation(() => Member) // @Args => param decorator
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		return await this.memberService.login(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query: checkAuth');
		console.log('memberNick:', memberNick);
		return `Hi ${memberNick}`;
	}

	@Roles(MemberType.USER, MemberType.AGENT) // aynan USER qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Mutation: checkAuthRoles');
		return `Hi ${authMember.memberNick} You are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	// Authenticated bo'lgan userlar qila oldadi, user,agent, admin
	@UseGuards(AuthGuard) // auth bo'lgan bo'lsagina keyinga o'tkazadi, intersepteranham avval ishga tushadi
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId, // @AuthMember() custom decorator orqali authMember(login bo'gan user malumoti) qabul qilamz
	): Promise<Member> {
		console.log('Mutation: updateMember');
		delete input._id; // krib kegan inputni idsini o'chiramz o'rniga MemberUpdateni ichidagisini ishlatamz
		return await this.memberService.updateMember(memberId, input);
	}

	@UseGuards(WithoutGuard) // WithoutGuard // auzorzeshn
	@Query(() => Member)
	public async getMember(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Member> {
		console.log('Query: getMember');
		// console.log('memberId:', memberId);
		const targetid = shapeIntoMongoObjectId(input);
		return await this.memberService.getMember(memberId, targetid);
	}

	@UseGuards(WithoutGuard) // authorisation
	@Query(() => Members)
	public async getAgents(@Args('input') input: AgentsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Members> {
		console.log('Query: getAgents');
		return await this.memberService.getAgents(memberId, input);
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN) // aynan admin qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Query(() => Members)
	public async getAllMembersByAdmin(@Args('input') input: MembersInquiry): Promise<Members> {
		console.log('Query: getAllMembersByAdmin');
		return await this.memberService.getAllMembersByAdmin(input);
	}

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN) // aynan admin qila oladi, rolesni yukladik
	@UseGuards(RolesGuard)
	@Mutation(() => Member)
	public async updateMemberByAdmin(@Args('input') input: MemberUpdate): Promise<Member> {
		console.log('Mutation: updateMemberByAdmin');
		return await this.memberService.updateMemberByAdmin(input);
	}

	/** UPLOADER **/

	@UseGuards(AuthGuard)
	@Mutation((returns) => String)
	public async imageUploader(
		// 1ta image
		@Args({ name: 'file', type: () => GraphQLUpload }) // file nomi bn, GraphQLUpload typesi bn
		{ createReadStream, filename, mimetype }: FileUpload, // FileUploadni ichidan unga tegshli datalar(type)ni olamz, distraction
		@Args('target') target: String, // target orqali serverga yuborilgan imggni qayerga saqlashini belgilaymiz
	): Promise<string> {
		console.log('Mutation: imageUploader');

		if (!filename) throw new Error(Message.UPLOAD_FAILED); // check
		const validMime = validMimeTypes.includes(mimetype); // img formatni ichida mimetype borligi
		if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT); // check

		const imageName = getSerialForImage(filename); //random name
		const url = `uploads/${target}/${imageName}`; // uploads folderini target nomli folderiga saqlasin
		const stream = createReadStream(); // createReadStream orqali folder ochiladi

		const result = await new Promise((resolve, reject) => {
			stream
				.pipe(createWriteStream(url)) // hosil qilingan url paas qilinadi //databaceda ochamz
				.on('finish', async () => resolve(true)) // muofaqiyatli bo'lsa resolve ishga tushadi
				.on('error', () => reject(false)); // error bolsa false
		});
		if (!result) throw new Error(Message.UPLOAD_FAILED);

		return url; // yuklangan manzilni return qilamz
	}

	@UseGuards(AuthGuard)
	@Mutation((returns) => [String])
	public async imagesUploader(
		// 1dan ko'p property images
		@Args('files', { type: () => [GraphQLUpload] })
		files: Promise<FileUpload>[],
		@Args('target') target: String,
	): Promise<string[]> {
		console.log('Mutation: imagesUploader');

		const uploadedImages = [];
		const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
			try {
				const { filename, mimetype, encoding, createReadStream } = await img;

				const validMime = validMimeTypes.includes(mimetype);
				if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

				const imageName = getSerialForImage(filename);
				const url = `uploads/${target}/${imageName}`;
				const stream = createReadStream();

				const result = await new Promise((resolve, reject) => {
					stream
						.pipe(createWriteStream(url))
						.on('finish', () => resolve(true))
						.on('error', () => reject(false));
				});
				if (!result) throw new Error(Message.UPLOAD_FAILED);

				uploadedImages[index] = url;
			} catch (err) {
				console.log('Error, file missing!');
			}
		});

		await Promise.all(promisedList); //hammasini yuklashini taminlaydi
		return uploadedImages;
	}
}
