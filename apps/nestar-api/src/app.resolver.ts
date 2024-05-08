import { Query, Resolver } from '@nestjs/graphql';

@Resolver() // bu decoator oddiy javascript classni Resolverg aylantrib beradi
export class AppResolver {
	@Query(() => String)
	public sayHello(): string {
		return 'GraphQl API Server';
	}
}
