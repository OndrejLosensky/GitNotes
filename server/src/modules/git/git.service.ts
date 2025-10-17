import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import { PullResultDto } from './dto';
import { ERROR_MESSAGES } from '../../core/constants/error-messages.const';

@Injectable()
export class GitService implements OnModuleInit {
  private git: SimpleGit;
  private readonly logger = new Logger(GitService.name);
  private readonly notesPath: string;
  private readonly repoUrl: string;
  private readonly githubToken: string;

  constructor(private configService: ConfigService) {
    const notesPath = this.configService.get<string>('NOTES_PATH');
    const repoUrl = this.configService.get<string>('GITHUB_REPO_URL');
    const githubToken = this.configService.get<string>('GITHUB_TOKEN');

    if (!notesPath) {
      throw new Error('NOTES_PATH is not configured');
    }
    if (!repoUrl) {
      throw new Error('GITHUB_REPO_URL is not configured');
    }
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN is not configured');
    }

    this.notesPath = notesPath;
    this.repoUrl = repoUrl;
    this.githubToken = githubToken;
  }

  async onModuleInit() {
    await this.ensureCloned();
  }

  private getAuthenticatedRepoUrl(): string {
    // Convert https://github.com/user/repo.git to https://token@github.com/user/repo.git
    if (this.githubToken && this.repoUrl.startsWith('https://')) {
      return this.repoUrl.replace('https://', `https://${this.githubToken}@`);
    }
    return this.repoUrl;
  }

  async ensureCloned(): Promise<void> {
    const resolvedPath = path.resolve(this.notesPath);
    // Check if directory exists and is a git repository
    if (
      fs.existsSync(resolvedPath) &&
      fs.existsSync(path.join(resolvedPath, '.git'))
    ) {
      this.logger.log(`Repository already cloned at ${resolvedPath}`);
      this.git = simpleGit(resolvedPath);
      return;
    }

    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(resolvedPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    // Remove directory if it exists but is not a git repo
    if (fs.existsSync(resolvedPath)) {
      fs.rmSync(resolvedPath, { recursive: true, force: true });
    }

    this.logger.log(`Cloning repository to ${resolvedPath}...`);

    try {
      this.git = simpleGit();
      await this.git.clone(this.getAuthenticatedRepoUrl(), resolvedPath);
      this.git = simpleGit(resolvedPath);
      this.logger.log('Repository cloned successfully');
    } catch (error) {
      this.logger.error('Failed to clone repository', error);
      throw error;
    }
  }

  async pullLatest(): Promise<PullResultDto> {
    try {
      this.logger.log('Pulling latest changes...');
      const result = await this.git.pull();

      if (
        result.summary.changes > 0 ||
        result.summary.insertions > 0 ||
        result.summary.deletions > 0
      ) {
        this.logger.log(
          `Pulled changes: ${result.summary.changes} files changed`,
        );
        return new PullResultDto({
          success: true,
          message: `Successfully pulled ${result.summary.changes} changes`,
          filesChanged: result.summary.changes,
          insertions: result.summary.insertions,
          deletions: result.summary.deletions,
        });
      } else {
        this.logger.log('Already up to date');
        return new PullResultDto({
          success: true,
          message: 'Already up to date',
          filesChanged: 0,
          insertions: 0,
          deletions: 0,
        });
      }
    } catch (error) {
      this.logger.error('Failed to pull latest changes', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new PullResultDto({
        success: false,
        message: `${ERROR_MESSAGES.GIT_PULL_ERROR}: ${errorMessage}`,
      });
    }
  }

  getNotesPath(): string {
    return path.resolve(this.notesPath);
  }
}
