import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(password: string): Promise<{ access_token: string }> {
    const hashedPassword = this.configService.get<string>('AUTH_PASSWORD');

    if (!hashedPassword) {
      throw new Error('AUTH_PASSWORD is not configured');
    }

    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: 'user', timestamp: Date.now() };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
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
