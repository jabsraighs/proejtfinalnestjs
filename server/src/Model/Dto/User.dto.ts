import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @Type(() => String)
  email: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  password: string;

  @ApiProperty()
  @IsString()
  @Type(() => String)
  name: string;
}
export class FindAllUsersDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number;
}
export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  @Type(() => String)
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Type(() => String)
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Type(() => String)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Type(() => String)
  profileColor?: string;
}
