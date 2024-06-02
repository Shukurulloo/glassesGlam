import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';

// TCP connectionimz aynan qaysi transportsni qo'llashini belgilaymz. secure bo'lmasin
@WebSocketGateway({ transports: ['wepsocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway'); //loggerlar un hizmat qiladigon state hosl qilamz nomi "SocketEventsGateway"
	private summaryClient: number = 0; // ulangan clientlar soni

	public afterInit(server: Server) {
		// bu SocketGateway tayyor bo'gan vaqtda ishga tushadi yani logger orqali terminalda printout bo'ladi
		this.logger.log(`WebSocket Server Initialized total: ${this.summaryClient}`); // inishelayz bo'gani haqida malumot va ulangan clientlar soni
	}
/** bu method clientlar bizni wepsocket serverimzga ulangan vaqti ishga tushadi
      1-serverga ulangan client datasi, 2-dok bo'yicha */
  handleConnection(client: WebSocket, ...args: any[]) {
    this.summaryClient++;   // birinchi ulangan vaqti clientlar soni 1+ ga oshadi
    this.logger.log(`== Client connected total: ${this.summaryClient} ==`) // va terminalda shu datalarni log methodi orqali chop etamz
  } 
/** bu method wepsocket serverimzga ulangan clientlar browserdan chiqib ketganda ishga tushadi */
  handleDisconnect(client: WebSocket) {
    this.summaryClient--;
    this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`)
  }

	@SubscribeMessage('message') // messagega subscribe bolganda
	public handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}
}
