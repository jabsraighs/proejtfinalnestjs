/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { MessageService } from '../Service/message.service';
import { CreateMessageDto } from '../Model/Dto/message.dto';
import { JwtAuthGuard } from '../Auth/Guards/jwt.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() createMessageDto: CreateMessageDto) {
    return this.messageService.sendMessage(req.user.id, createMessageDto);
  }

  @Get('conversation/:otherUserId')
  getConversation(@Request() req: RequestWithUser, @Param('otherUserId') otherUserId: string) {
    return this.messageService.getConversation(req.user.id, otherUserId);
  }

  @Get('received')
  getReceivedMessages(@Request() req: RequestWithUser) {
    return this.messageService.getReceivedMessages(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.messageService.markAsRead(id, req.user.id);
  }
}
