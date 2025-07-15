import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../Model/message.model';
import { User } from '../Model/user.model';
import { MessageService } from '../Service/message.service';
import { MessageController } from '../Controller/message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
