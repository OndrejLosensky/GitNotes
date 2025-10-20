import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
  Delete,
  Param,
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
  GitHistoryDto,
  BranchListDto,
  BranchDto,
  CreateBranchDto,
  CheckoutBranchDto,
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

  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getHistory(@Query('limit') limit?: string): Promise<GitHistoryDto> {
    const limitNumber = limit ? Math.min(parseInt(limit, 10) || 10, 50) : 10;
    return await this.gitService.getCommitHistory(limitNumber);
  }

  @Get('branches')
  @HttpCode(HttpStatus.OK)
  async getBranches(): Promise<BranchListDto> {
    return await this.gitService.getBranches();
  }

  @Get('branches/current')
  @HttpCode(HttpStatus.OK)
  async getCurrentBranch(): Promise<{ branch: string }> {
    const branch = await this.gitService.getCurrentBranch();
    return { branch };
  }

  @Post('branches')
  @HttpCode(HttpStatus.CREATED)
  async createBranch(
    @Body() dto: CreateBranchDto,
  ): Promise<BranchDto> {
    try {
      return await this.gitService.createBranch(dto.name, dto.from);
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to create branch',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkoutBranch(
    @Body() dto: CheckoutBranchDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.gitService.checkoutBranch(dto.branch);
      return {
        success: true,
        message: `Successfully switched to branch: ${dto.branch}`,
      };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to checkout branch',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('branches/:name')
  @HttpCode(HttpStatus.OK)
  async deleteBranch(
    @Param('name') name: string,
    @Query('force') force?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const forceDelete = force === 'true';
      await this.gitService.deleteBranch(name, forceDelete);
      return { success: true, message: `Successfully deleted branch: ${name}` };
    } catch (error) {
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to delete branch',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
