/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty()
  @IsNotEmpty()
  senderColor: string;

}