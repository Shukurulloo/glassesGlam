import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';

interface MessagePayload {
	// fronenda data yuborish yoki qabul qilish un
	event: string;
	text: string;
}

// kimdir serverga ulansa yangi conectionni biz uchun serverimz boshqa memberlarga data yuborishi un
interface InfoPayload {
	event: string;
	totalClient: number; // yangilangan clientlar sonini yuborish uchun
}

// TCP connectionimz aynan qaysi transportsni qo'llashini belgilaymz. secure bo'lmasin
@WebSocketGateway({ transports: ['wepsocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway'); //loggerlar un hizmat qiladigon state hosl qilamz nomi "SocketEventsGateway"
	private summaryClient: number = 0; // ulangan clientlar soni

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		// bu SocketGateway tayyor bo'gan vaqtda ishga tushadi yani logger orqali terminalda printout bo'ladi
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`); // inishelayz bo'gani haqida malumot va ulangan clientlar soni
	}
	/** bu method clientlar bizni wepsocket serverimzga ulangan vaqti ishga tushadi
      1-serverga ulangan client datasi, 2-dok bo'yicha */
	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++; // birinchi ulangan vaqti clientlar soni 1+ ga oshadi
		this.logger.verbose(`Connection & total [${this.summaryClient}]`); // va terminalda shu datalarni log methodi orqali chop etamz

		// websocket serverimzga yangi client qoshilganida umumiy clientlar sonini hamma ulangan clientlarga yunosih mantig'i
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClient: this.summaryClient,
		};
		this.emitMessage(infoMsg);
	}
	/** bu method wepsocket serverimzga ulangan clientlar browserdan chiqib ketganda ishga tushadi */
	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.verbose(`Disconnection & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClient: this.summaryClient,
		};

		// client - disconnect
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message') // messagega subscribe bolganda
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const newMessage: MessagePayload = { event: 'message', text: payload };

		this.logger.verbose(`NEW MESSAGE: ${payload}`)
		this.emitMessage(newMessage) // hamma ulangan webSocket clientlarga yuborish
	}

	// uzilgan clientdan boshqa hammasiga yuborish
	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	// hamma ulangan clientlarga yuborish uchun mahssu method
	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}
