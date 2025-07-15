import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepositoryInterface } from '@application/RepositoryInterfaces/UserRepositoryInterface';
import { JwtService } from '@nestjs/jwt';
import { AuthPayloadDto } from '../Models/Dto/Auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    private jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: AuthPayloadDto) {
    const user = await this.userRepository.findByEmail(email);

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
}
