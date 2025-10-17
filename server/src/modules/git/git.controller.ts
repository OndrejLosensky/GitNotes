import { Controller, Post, UseGuards } from '@nestjs/common';
import { GitService } from './git.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('git')
@UseGuards(JwtAuthGuard)
export class GitController {
  constructor(private gitService: GitService) {}

  @Post('pull')
  async pull() {
    return this.gitService.pullLatest();
  }
}
