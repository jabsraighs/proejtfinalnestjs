/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../Service/auth.service';
import { AuthPayloadDto } from 'src/Model/Dto/auth.dto';
import { JwtAuthGuard } from '../Auth/Guards/jwt.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    return this.authService.validateUser(authPayload);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return this.authService.getUserProfile(req.user.id);
  }
}
