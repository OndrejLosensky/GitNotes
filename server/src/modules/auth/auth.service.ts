import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponseDto } from './dto';
import { ERROR_MESSAGES } from '../../core/constants/error-messages.const';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const hashedPassword = this.configService.get<string>('AUTH_PASSWORD');

    if (!hashedPassword) {
      throw new Error(ERROR_MESSAGES.AUTH_PASSWORD_NOT_CONFIGURED);
    }

    const isValid = await bcrypt.compare(loginDto.password, hashedPassword);

    if (!isValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH_INVALID_PASSWORD);
    }

    const payload = { sub: 'user', timestamp: Date.now() };
    const access_token = await this.jwtService.signAsync(payload);

    return new AuthResponseDto(access_token);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      return false;
    }
  }
}
