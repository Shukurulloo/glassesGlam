import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [SocketGateway],
})
export class SocketModule {}







//HTTP vs Web Socket yani TCP connectionlar orasidagi tafavutni qilamiz 
// HTTP deb nomlanishiga asosiy sabab bu Protocol yani HTTPni manosi HyperText Transfer Protocol deb nomlanadi 
//biz aytalik amazon.com sahifaga tashrif buyursak bizninng browserimiz
// browser "Client" ------> HTTP request ---->Server ga HTTP requestni amalga oshiradi biz shu kunga qadar amalga oshirgan REST API va 
// GRAPHQL API lar HTTP Req orqali amalga oshiriladi bu orqali Serverdan turli tuman malumotlar qabul etiladi 
// yani Clientimiz -> HTTP req -> server -> koplab cleintlarga jonatadi  malum bir api orqali bizi serverga req qiladi va bizi server qaysi cleitga javob 
//berishni osha api orqali xal etadi HTTP -> Operates on a request-response model asosida oz  faoliyatini amalga oshiradi 
//bizi clientimiz -> Http req -> serverga malumotlar un req amalga oshirdi va bizi server client <- res HTTP <- server
//soragan malumotlarni clientga response qildi va  response qilgandan keyin bizi connectionimiz butunlay yoq bb ketadi 
// yani Interprets the response data & renders the web page yani bu bir martalik malumotlar olish manbayini taminlab beradigon 
//connectionni client hamda server orasida amalga oshirib beradi -> ! Unless the client sends a request again ...
//bizga bir martalik malumotlarni olib bermasin Client va server bir vaqtni ozida malumotlarni bir biriga yuborish mehanizminni joriy etamiz 
// * HTTP's communication is stateless HTTP amalga oshirib berolmasligini sababi stateless communication xisoblanadi
// * It doest not stay connected with the server
// * The server connot directly communicate with the cleint buni HTTP amalga oshirrib berolmeydi 
  
//Transmission Control Protocol (TCP)
//TCP/ IP clientimizni malimotlari doyim yangilanib tusin masalan  online oyin ham shundey 
//yangilangan malumotni doyim refresh qilib qabul qilishimiz mumkin yoki POLLONG qilishimiz mumkin bir malum birr vaqtda qayta qayta
// reqni HTTP orqali amalga oshirishimiz mumkin buham yaxshi yol xisoblanmaydi ayanan shuning un TCP conecction yordamga keladi
// bizi clientimiz serverga doyimi aloqani TCP orqali tashkilaydi Cleintimiz va serverlar orasida uzuliksiz malumotlar almashuvi boladi
// google.crome bn nodejs uzuliksiz aloqa telefonda galashish munosabatiga oxshatish mumkin 
// Client ---> WEB Socket ----> Socket 
// WEB Socket Bi-Directional, full-duplex communication protocol built on top of Transmission Control Protocol (TCP)
//allowiing a persistent conecction between the client & the server 
// full-duplex xisoblanadi chunki comunicationimiz TCP ustida quriladi buni natijasida cleinva serverlar orasida uzuliksiz malumotlar 
//almashish tizimini  joriy etolamiz 
//TCPni aynan qayerda ishlatamiz * Real-time chats xosil qilishda , Live notifications turli xil notificationslarni qabul etishda 
// , Online gamimng bizning browserimizni ichida qandaydur online oyin mavjud bola va uni malumotlari uzuliksiz ravishda 
// auto ravishda yangilanib. turishi kerak , Interacttive web applications  da WEB SOCKET texnalogiyasidan foydalanamiz 

// HTTP Requestlar bu faqatgina bir martalik connectioni amalga oshirish natijasida req va response model orqali clientimiz
// serverdan malumotlarni olish mexanizimga aytiladikan