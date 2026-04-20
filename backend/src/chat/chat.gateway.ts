import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup if needed
  }

  @SubscribeMessage('joinDeal')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() dealId: string) {
    client.join(`deal:${dealId}`);
    this.chatService.getMessages(dealId).then((msgs) => {
      client.emit('history', msgs);
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { dealId: string; content: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data.content?.trim()) return;

    const message = await this.chatService.saveMessage(
      data.dealId,
      userId,
      data.content.trim(),
    );

    this.server.to(`deal:${data.dealId}`).emit('newMessage', message);
  }

  @SubscribeMessage('markRead')
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() dealId: string,
  ) {
    const userId = client.data.userId;
    if (userId) this.chatService.markRead(dealId, userId);
  }
}
