import { Query, Resolver } from '@nestjs/graphql';

// graphql ni hosl qilish uchun resolverlardan foydalanamz bu graphqlda asosiy vazifani bajaradi
// query => get, mutation => post bularni resolver orqali qilamz

@Resolver() // bu decoator oddiy javascript classni Resolverg aylantrib beradi
export class AppResolver {
	@Query(() => String)
	public sayHello(): string {
		return 'GraphQl API Server';
	}
}
