/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AuthPayloadDto {
  @ApiProperty()
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  password: string;
}
