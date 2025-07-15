/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { AuthPayloadDto } from 'src/Model/Dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: AuthPayloadDto) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User does not exist.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      access_token: this.jwtService.sign(userWithoutPassword),
    };
  }
  async getUserProfile(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const { password, ...result } = user;
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
