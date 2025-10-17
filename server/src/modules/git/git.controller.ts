import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GitService } from './git.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PullResultDto } from './dto';

@Controller('git')
@UseGuards(JwtAuthGuard)
export class GitController {
  constructor(private gitService: GitService) {}

  @Post('pull')
  @HttpCode(HttpStatus.OK)
  async pull(): Promise<PullResultDto> {
    return this.gitService.pullLatest();
  }
}
