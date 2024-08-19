import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// request va responselarni log qilib beradi
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger();

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requesType = context.getType<GqlContextType>();

		if (requesType === 'http') {
			// console.log('requesType', requesType);
           
			/**  Develop if needed! **/
		} else if (requesType === 'graphql') {
			/** (1) Print Request  **/
			const gqlContext = GqlExecutionContext.create(context);

			this.logger.log(` ${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			/** (2) Errors handling via GraphQL  **/

			/** (3) No Errors, giving Response below   **/

			return next.handle().pipe(
				tap((context) => {
					const responseTime = Date.now() - recordTime;
					this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, 'RESPONSE');
				}),
			);
		}
	}
	private stringify(context: ExecutionContext): string {
		return JSON.stringify(context).slice(0, 75);
	}
}