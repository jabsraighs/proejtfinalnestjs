import {
  Controller,
  Post,
  Body,
  HttpException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthPayloadDto } from '../Models/Dto/Auth.dto';
import { AuthService } from '../Service/auth.service';
import { JwtAuthGuard } from '../Guards/guardAuth/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    return this.authService.validateUser(authPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile() {
    return { message: 'Profile accessible' };
  }
}
