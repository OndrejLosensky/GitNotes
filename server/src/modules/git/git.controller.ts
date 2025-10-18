import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GitService } from './git.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PullResultDto,
  GitStatusDto,
  StageFilesDto,
  UnstageFilesDto,
} from './dto';

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

  @Post('stage')
  @HttpCode(HttpStatus.OK)
  async stage(@Body() dto: StageFilesDto): Promise<GitStatusDto> {
    if (dto.all) {
      await this.gitService.stageAll();
    } else if (dto.files) {
      for (const file of dto.files) {
        await this.gitService.stageFile(file);
      }
    }
    return await this.gitService.getStatus();
  }

  @Post('unstage')
  @HttpCode(HttpStatus.OK)
  async unstage(@Body() dto: UnstageFilesDto): Promise<GitStatusDto> {
    for (const file of dto.files) {
      await this.gitService.unstageFile(file);
    }
    return await this.gitService.getStatus();
  }
}
