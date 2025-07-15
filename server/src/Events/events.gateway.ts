/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../Service/message.service';
import { UserService } from '../Service/user.service';

interface OnlineUser {
  userId: string;
  name: string;
  color: string;
}

interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
  name?: string;
  color?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.userService.getUserFromToken(token);
      if (!user) {
        client.disconnect();
        return;
      }
      this.connectedUsers.set(user.id, client.id);

      const userStatus: UserStatus = {
        userId: user.id,
        status: 'online',
        name: user.name,
        color: user.profileColor,
      };
      this.server.emit('userStatus', userStatus);

      const onlineUsers: OnlineUser[] = [];
      for (const [userId, _] of this.connectedUsers) {
        const onlineUser = await this.userService.findById(userId);
        if (onlineUser) {
          onlineUsers.push({
            userId: onlineUser.id,
            name: onlineUser.name,
            color: onlineUser.profileColor,
          });
        }
      }
      client.emit('onlineUsers', onlineUsers);

      client.join(`user_${user.id}`);

      console.log(`User ${user.name} connected: ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      this.connectedUsers.delete(disconnectedUserId);
      const userStatus: UserStatus = {
        userId: disconnectedUserId,
        status: 'offline',
      };
      this.server.emit('userStatus', userStatus);

      console.log(`User ${disconnectedUserId} disconnected`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string; receiverId: string; senderColor: string },
  ) {
    try {
      const token = client.handshake.auth.token;
      const sender = await this.userService.getUserFromToken(token);

      if (!sender) {
        return { error: 'Unauthorized' };
      }

      const senderColor = payload.senderColor || sender.profileColor;
      
      const message = await this.messageService.create({
        content: payload.content,
        senderId: sender.id,
        receiverId: payload.receiverId,
        senderColor: senderColor
      });
      
      const messageWithUserInfo = {
        ...message,
        sender: {
          id: sender.id,
          name: sender.name,
          profileColor: sender.profileColor,
        },
      };
      
      if (this.connectedUsers.has(payload.receiverId)) {
        this.server.to(`user_${payload.receiverId}`).emit('newMessage', messageWithUserInfo);
      }

      client.emit('newMessage', messageWithUserInfo);

      return { success: true, message };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string },
  ) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.userService.getUserFromToken(token);

      if (!user) {
        return { error: 'Unauthorized' };
      }

      await this.messageService.markAsRead(payload.messageId, user.id);
      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { error: 'Failed to mark message as read' };
    }
  }

  @SubscribeMessage('getUnreadMessages')
  async handleGetUnreadMessages(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.userService.getUserFromToken(token);

      if (!user) {
        return { error: 'Unauthorized' };
      }

      const unreadMessages = await this.messageService.getUnreadMessages(user.id);
      return { success: true, messages: unreadMessages };
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      return { error: 'Failed to fetch unread messages' };
    }
  }

  @SubscribeMessage('getConversation')
  async handleGetConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { otherUserId: string },
  ) {
    try {
      const token = client.handshake.auth.token;
      const user = await this.userService.getUserFromToken(token);

      if (!user) {
        return { error: 'Unauthorized' };
      }

      const messages = await this.messageService.getConversation(user.id, payload.otherUserId);
      return { success: true, messages };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { error: 'Failed to fetch conversation' };
    }
  }
}