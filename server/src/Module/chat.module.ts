/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Message } from '../Model/message.model';
import { User } from '../Model/user.model';
import { MessageService } from '../Service/message.service';
import { ChatGateway } from '../Events/events.gateway';
import { UserService } from '../Service/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [MessageService, ChatGateway, UserService],
  exports: [MessageService],
})
export class ChatModule {}
