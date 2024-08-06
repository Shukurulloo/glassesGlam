import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_AGENTS, BATCH_TOP_PROPERTIES } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController'); //loggerlar un hizmat qiladigon state hosl qilamz nomi "BatchController"

	constructor(private readonly BatchService: BatchService) {}

	@Timeout(1000) // bu malum vaqt o'tgach malum bir mantiqni ishga tushirib beradi
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	/** 
	  Cron() => jobSchedule larni yasab beradi
	 * 1-arg => cron time: qachon ishga tushushini begilaymiz
	 * 2-arg => nomi */
	@Cron('00 * * * * *', { name: BATCH_ROLLBACK }) // yarm tunda soat 1da ishga tushsin va rankni 0ga tenglasin  sutkada 1marta // '00 00 01 * * *'
	public async batchRollBack() {
		// cron ishga tushgach ishlaydigon mantiq
		try {
			this.logger['context'] = BATCH_ROLLBACK; // logni aniqlashtrib olamz
			this.logger.debug('EXECUTED!'); // chop etamz
			await this.BatchService.batchRollBack();
		} catch (err) {
			this.logger.error(err); // errorni boshqacha ko'ronishda chop qiladi
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_PROPERTIES }) //yarm tun soat 1 ni yigirmanchi minutida ishga tushsin
	public async batchTopProperties() {
		try {
			this.logger['context'] = BATCH_TOP_PROPERTIES;
			this.logger.debug('EXECUTED!');
			await this.BatchService.batchTopProperties();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_AGENTS }) // kunda bir bor 
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTED!');
			await this.BatchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	/** 
  @Interval(1000) // har sekunda ishga tushadi
	handleInterval() {
		this.logger.debug('INTERVAL TEST'); // batch server uchun debug dan foydalanamz boshqa serverdan faqrlanishi un rangi pushti
	}
   */

	@Get()
	getHello(): string {
		return this.BatchService.getHello();
	}
}
