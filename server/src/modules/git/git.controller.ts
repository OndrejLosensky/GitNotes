import {
  Controller,
  Post,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GitService } from './git.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PullResultDto, GitStatusDto } from './dto';

@Controller('git')
@UseGuards(JwtAuthGuard)
export class GitController {
  constructor(private gitService: GitService) {}

  @Post('pull')
  @HttpCode(HttpStatus.OK)
  async pull(): Promise<PullResultDto> {
    return this.gitService.pullLatest();
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(): Promise<GitStatusDto> {
    return await this.gitService.getStatus();
  }
}
