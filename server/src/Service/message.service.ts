/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../Model/message.model';
import { User } from '../Model/user.model';
import { CreateMessageDto } from '../Model/Dto/message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async sendMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    return this.create({
      content: createMessageDto.content,
      senderId: senderId,
      receiverId: createMessageDto.receiverId,
      senderColor: createMessageDto.senderColor,
    });
  }

  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getReceivedMessages(userId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { receiverId: userId },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId, receiverId: userId },
    });

    if (!message) {
      throw new NotFoundException('Message non trouvé');
    }

    message.isRead = true;
    return this.messagesRepository.save(message);
  }
  
  async create(messageData: {
    content: string;
    senderId: string;
    receiverId: string;
    senderColor: string
  }): Promise<Message> {
    const sender = await this.usersRepository.findOne({ where: { id: messageData.senderId } });
    const receiver = await this.usersRepository.findOne({ where: { id: messageData.receiverId } });

    if (!sender || !receiver) {
      throw new NotFoundException('User not found');
    }

    const message = new Message();
    message.content = messageData.content;
    message.senderId = messageData.senderId;
    message.receiverId = messageData.receiverId;
    message.sender = sender;
    message.receiver = receiver;
    message.isRead = false;
    message.senderColor = messageData.senderColor; 
    
    return this.messagesRepository.save(message);
  }

  async getUnreadMessages(userId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: {
        receiverId: userId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
      relations: ['sender'],
    });
  }
}