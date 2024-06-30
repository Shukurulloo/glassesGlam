import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';

interface MessagePayload {
	// fronenda data yuborish yoki qabul qilish un
	event: string;
	text: string;
	memberData: Member;
}

// kimdir serverga ulansa yangi conectionni biz uchun serverimz boshqa memberlarga data yuborishi un
interface InfoPayload {
	event: string;
	totalClient: number; // yangilangan clientlar sonini yuborish uchun
	memberData: Member;
	action: string; // joined, left
}

// TCP connectionimz aynan qaysi transportsni qo'llashini belgilaymz. secure bo'lmasin
@WebSocketGateway({ transports: ['wepsocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway'); //loggerlar un hizmat qiladigon state hosl qilamz nomi "SocketEventsGateway"
	private summaryClient: number = 0; // ulangan clientlar soni
	private clientsAuthMap = new Map<WebSocket, Member>();
	private messagesList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		// bu SocketGateway tayyor bo'gan vaqtda ishga tushadi yani logger orqali terminalda printout bo'ladi
		this.logger.verbose(`WebSocket Server Initialized & total [${this.summaryClient}]`); // inishelayz bo'gani haqida malumot va ulangan clientlar soni
	}
	// kim murojat etganini aniqlaymz
	private async retrieveAuth(req: any): Promise<Member> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query; // url core packagesi orqali tokenni olamz
			// console.log('token:', token);
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	/** bu method clientlar bizni wepsocket serverimzga ulangan vaqti ishga tushadi
      1-serverga ulangan client datasi, 2-dok bo'yicha */
	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req); // auth bo'lgan member mavjud bo'lsa uni qiymatini qaytarsin
		this.summaryClient++; // birinchi ulangan vaqti clientlar soni 1+ ga oshadi
		this.clientsAuthMap.set(client, authMember); // key: client => authMember qilib saqlaymz
		// console.log('authMember:', authMember);

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Connection [${clientNick}] & total [${this.summaryClient}]`); // va terminalda shu datalarni log methodi orqali chop etamz

		// websocket serverimzga yangi client qoshilganida umumiy clientlar sonini hamma ulangan clientlarga yunosih mantig'i
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClient: this.summaryClient,
			memberData: authMember,
			action: 'joined',
		};
		this.emitMessage(infoMsg); // serverga ulangan hammaga yuborish
		// CLIENT MESSAGES . ulangan clientni o'ziga habar yuborish mantig'i
		client.send(JSON.stringify({ event: 'getMessages', list: this.messagesList }));
	}
	/** bu method wepsocket serverimzga ulangan clientlar browserdan chiqib ketganda ishga tushadi */
	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientsAuthMap.get(client); // left bolgan memberni olib beradi
		this.summaryClient--;
		this.clientsAuthMap.delete(client); // o'chiramz

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`Disconnection [${clientNick}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClient: this.summaryClient,
			memberData: authMember,
			action: 'left',
		};

		// client - disconnect.  uzilgandan boshqa hammaga yuborish
		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message') // messagega subscribe bolganda
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authMember = this.clientsAuthMap.get(client);
		const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember };

		const clientNick: string = authMember?.memberNick ?? 'Guest';
		this.logger.verbose(`NEW MESSAGE [${clientNick}]: ${payload}`);

		this.messagesList.push(newMessage);
		if (this.messagesList.length > 5) this.messagesList.splice(0, this.messagesList.length - 5); // faqat 5ta habar

		this.emitMessage(newMessage); // hamma ulangan webSocket clientlarga yuborish
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

/*
MESSAGE TARGET: 
	1. Client    (only client)  faqat 1taga
	2. Broadcast (exept client) uzilgandan boshqa hammaga
	3. Emit      (all client)   hammaga
*/
