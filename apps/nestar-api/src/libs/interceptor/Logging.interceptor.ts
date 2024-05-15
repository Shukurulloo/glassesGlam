import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
// request va responselarni log qilib beradi
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger(); // Logger => request va responeni chop etish un kerak

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		// Observable FRP ni consepsiasi, promise bn bir xil
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>(); // qanday turdagi requestlar backentga kelishini aniqlaash un getType kerak

		if (requestType === 'http') {
			/* Developif needed! */
		} else if (requestType === 'graphql') {
			/* (1) Print Request */
			const gqlContext = GqlExecutionContext.create(context);
			// clientdan yuborayotgan queryni sintaksini oldik
			this.logger.log(`${this.stringify(gqlContext.getContext().req.body)}`, 'REQUEST');

			/* (2) Error handling via graphQL */

			/* (3) No Errors, giving Response below */
			return next.handle().pipe(
				// handling qilsh jarayonida login ishga tushadi
				tap((context) => {
					/** responseTime: serverimz kirib kegan requstni javob berayotgan vaqtdan 
                        serverga kirib kelgan vaqtni ayrimasiga teng bo'ladi */
					const responseTime = Date.now() - recordTime;
					this.logger.log(`${this.stringify(context)} - ${responseTime}ms \n\n`, 'RESPONSE'); //logger orqali printout qilamz
				}),
			);
		}
	}

	private stringify(context: ExecutionContext): string {
		// krib kelayotgan  context object bo'ladi
		return JSON.stringify(context).slice(0, 75); // stringni 75 gacha miqdorini olamz olamz
	}
}
