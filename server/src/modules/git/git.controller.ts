import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { GitService } from './git.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PullResultDto,
  GitStatusDto,
  StageFilesDto,
  UnstageFilesDto,
  CreateCommitDto,
  CommitResponseDto,
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

  @Post('commit')
  @HttpCode(HttpStatus.OK)
  async commit(@Body() dto: CreateCommitDto): Promise<CommitResponseDto> {
    const result = await this.gitService.commit(dto.message, dto.files);
    
    if (!result.success) {
      throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    }
    
    return new CommitResponseDto(result.success, result.hash, result.message);
  }

  @Post('push')
  @HttpCode(HttpStatus.OK)
  async push(): Promise<{ success: boolean; message: string; error?: string }> {
    const result = await this.gitService.push();

    if (!result.success) {
      // Map error types to appropriate HTTP status codes
      switch (result.error) {
        case 'authentication':
          throw new HttpException(result.message, HttpStatus.UNAUTHORIZED);
        case 'conflict':
          throw new HttpException(result.message, HttpStatus.CONFLICT);
        case 'network':
        case 'unknown':
        default:
          throw new HttpException(
            result.message,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    return result;
  }
}
