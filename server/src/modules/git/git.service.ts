import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import simpleGit, { SimpleGit } from 'simple-git';
import * as fs from 'fs';
import * as path from 'path';
import { PullResultDto, GitStatusDto, GitHistoryDto, BranchListDto, BranchDto, CommitDetailsDto } from './dto';
import { GitFileStatusEntity } from './entities/git-file-status.entity';
import { CommitEntity } from './entities/commit.entity';
import { FileDiffEntity, DiffChunk, DiffLine } from './entities/file-diff.entity';
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

  async getStatus(): Promise<GitStatusDto> {
    try {
      this.logger.log('Getting git status...');
      const status = await this.git.status();

      const modified: GitFileStatusEntity[] = [];
      const staged: GitFileStatusEntity[] = [];
      const untracked: GitFileStatusEntity[] = [];
      const deleted: GitFileStatusEntity[] = [];

      // Process all file changes
      for (const file of status.files) {
        const fileStatus = new GitFileStatusEntity({
          path: file.path,
          status: this.determineFileStatus(file.working_dir, file.index),
          workingDir: file.working_dir,
          index: file.index,
        });

        // Categorize files based on their status
        if (file.index !== ' ' && file.index !== '?') {
          // File is staged
          staged.push(fileStatus);
        }

        if (file.working_dir === 'M' || file.index === 'M') {
          // File is modified
          modified.push(fileStatus);
        } else if (file.working_dir === '?' || file.index === '?') {
          // File is untracked
          untracked.push(fileStatus);
        } else if (file.working_dir === 'D' || file.index === 'D') {
          // File is deleted
          deleted.push(fileStatus);
        }
      }

      this.logger.log(
        `Git status: ${modified.length} modified, ${staged.length} staged, ${untracked.length} untracked, ${deleted.length} deleted`,
      );

      return new GitStatusDto({
        modified,
        staged,
        untracked,
        deleted,
        branch: status.current || 'unknown',
        ahead: status.ahead || 0,
        behind: status.behind || 0,
      });
    } catch (error) {
      this.logger.error('Failed to get git status', error);
      throw error;
    }
  }

  async stageFile(filePath: string): Promise<void> {
    try {
      // Validate file path is within notes directory
      const resolvedPath = path.resolve(this.notesPath, filePath);
      const notesPath = path.resolve(this.notesPath);

      if (!resolvedPath.startsWith(notesPath)) {
        throw new Error('File path is outside notes directory');
      }

      this.logger.log(`Staging file: ${filePath}`);
      await this.git.add(filePath);
      this.logger.log(`Successfully staged file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to stage file: ${filePath}`, error);
      throw error;
    }
  }

  async stageAll(): Promise<void> {
    try {
      this.logger.log('Staging all changes...');
      await this.git.add('-A');
      this.logger.log('Successfully staged all changes');
    } catch (error) {
      this.logger.error('Failed to stage all changes', error);
      throw error;
    }
  }

  async unstageFile(filePath: string): Promise<void> {
    try {
      this.logger.log(`Unstaging file: ${filePath}`);
      await this.git.reset(['HEAD', '--', filePath]);
      this.logger.log(`Successfully unstaged file: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to unstage file: ${filePath}`, error);
      throw error;
    }
  }

  async commit(message: string, files?: string[]): Promise<{ hash: string; success: boolean; message: string }> {
    try {
      // Validate commit message
      if (!message || message.trim().length < 3) {
        return {
          success: false,
          hash: '',
          message: 'Commit message must be at least 3 characters long',
        };
      }

      if (message.length > 500) {
        return {
          success: false,
          hash: '',
          message: 'Commit message must not exceed 500 characters',
        };
      }

      // If specific files are provided, stage them first
      if (files && files.length > 0) {
        this.logger.log(`Staging ${files.length} specific files before commit`);
        for (const file of files) {
          await this.stageFile(file);
        }
      }

      // Check if there are staged changes
      const status = await this.git.status();
      const hasStagedChanges = status.staged.length > 0 || status.files.some(f => f.index !== ' ' && f.index !== '?');

      if (!hasStagedChanges) {
        return {
          success: false,
          hash: '',
          message: 'No changes staged for commit',
        };
      }

      // Perform the commit
      this.logger.log(`Creating commit with message: "${message}"`);
      const result = await this.git.commit(message);

      if (!result.commit) {
        return {
          success: false,
          hash: '',
          message: 'Commit failed - no commit hash returned',
        };
      }

      this.logger.log(`Successfully created commit: ${result.commit}`);

      return {
        success: true,
        hash: result.commit,
        message: `Successfully committed changes with hash: ${result.commit.substring(0, 7)}`,
      };
    } catch (error) {
      this.logger.error('Failed to create commit', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        hash: '',
        message: errorMessage,
      };
    }
  }

  async push(): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      // Check if there are commits to push
      const status = await this.git.status();
      if (status.ahead === 0) {
        this.logger.log('No commits to push - already up to date');
        return {
          success: true,
          message: 'Already up to date',
        };
      }

      this.logger.log(`Pushing ${status.ahead} commits to origin/${status.current || 'main'}`);

      // Set up authentication for push
      const authenticatedUrl = this.getAuthenticatedRepoUrl();
      await this.git.remote(['set-url', 'origin', authenticatedUrl]);

      // Perform the push
      const result = await this.git.push('origin', status.current || 'main');

      this.logger.log('Successfully pushed to remote repository');

      return {
        success: true,
        message: `Successfully pushed ${status.ahead} commits to GitHub`,
      };
    } catch (error) {
      this.logger.error('Failed to push to remote repository', error);
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Handle specific error cases
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('401')) {
        return {
          success: false,
          message: 'GitHub token invalid or expired',
          error: 'authentication',
        };
      }

      if (errorMessage.includes('rejected') || errorMessage.includes('non-fast-forward')) {
        return {
          success: false,
          message: 'Remote has changes. Pull first before pushing',
          error: 'conflict',
        };
      }

      if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorMessage.includes('ENOTFOUND')) {
        return {
          success: false,
          message: 'Failed to connect to GitHub',
          error: 'network',
        };
      }

      // Generic error
      return {
        success: false,
        message: `Push failed: ${errorMessage}`,
        error: 'unknown',
      };
    }
  }

  async getCommitHistory(limit: number = 10): Promise<GitHistoryDto> {
    try {
      this.logger.log(`Getting commit history (limit: ${limit})`);
      
      // Get commit log with specified limit
      const log = await this.git.log({
        maxCount: limit,
        format: {
          hash: '%H',
          author: '%an <%ae>',
          date: '%ai',
          message: '%s',
          refs: '%D'
        }
      });

      // Parse commits into CommitEntity objects
      const commits = log.all.map(commit => new CommitEntity({
        hash: commit.hash,
        author: commit.author,
        date: commit.date,
        message: commit.message,
        refs: commit.refs || undefined
      }));

      this.logger.log(`Retrieved ${commits.length} commits from history`);

      return new GitHistoryDto(commits);
    } catch (error) {
      this.logger.error('Failed to get commit history', error);
      throw error;
    }
  }

  private determineFileStatus(
    workingDir: string,
    index: string,
  ): 'modified' | 'added' | 'deleted' | 'untracked' | 'staged' {
    // Check if file is untracked
    if (workingDir === '?' || index === '?') {
      return 'untracked';
    }

    // Check if file is deleted
    if (workingDir === 'D' || index === 'D') {
      return 'deleted';
    }

    // Check if file is added
    if (index === 'A') {
      return 'added';
    }

    // Check if file is staged (in index but not modified in working dir)
    if (index !== ' ' && workingDir === ' ') {
      return 'staged';
    }

    // Default to modified
    return 'modified';
  }

  async getBranches(): Promise<BranchListDto> {
    try {
      this.logger.log('Getting branch list...');
      const result = await this.git.branch();
      
      const branches = result.all.map(name => new BranchDto({
        name,
        current: name === result.current,
        commit: result.branches[name]?.commit || 'unknown'
      }));

      this.logger.log(`Found ${branches.length} branches, current: ${result.current}`);
      return new BranchListDto(branches, result.current);
    } catch (error) {
      this.logger.error('Failed to get branches', error);
      throw error;
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      this.logger.log('Getting current branch...');
      const result = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      const branchName = result.trim();
      this.logger.log(`Current branch: ${branchName}`);
      return branchName;
    } catch (error) {
      this.logger.error('Failed to get current branch', error);
      throw error;
    }
  }

  async createBranch(name: string, fromBranch?: string): Promise<BranchDto> {
    try {
      // Validate branch name
      this.validateBranchName(name);

      this.logger.log(`Creating branch: ${name}${fromBranch ? ` from ${fromBranch}` : ''}`);
      
      if (fromBranch) {
        // Create branch from specific branch
        await this.git.checkoutBranch(name, fromBranch);
      } else {
        // Create branch from current branch
        await this.git.checkoutLocalBranch(name);
      }

      // Get the created branch info
      const currentBranch = await this.getCurrentBranch();
      const commit = await this.git.revparse(['HEAD']);
      
      this.logger.log(`Successfully created and checked out branch: ${name}`);
      
      return new BranchDto({
        name,
        current: true,
        commit: commit.trim()
      });
    } catch (error) {
      this.logger.error(`Failed to create branch: ${name}`, error);
      throw error;
    }
  }

  async checkoutBranch(name: string): Promise<void> {
    try {
      this.logger.log(`Checking out branch: ${name}`);
      await this.git.checkout(name);
      this.logger.log(`Successfully checked out branch: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to checkout branch: ${name}`, error);
      throw error;
    }
  }

  async deleteBranch(name: string, force: boolean = false): Promise<void> {
    try {
      // Check if trying to delete current branch
      const currentBranch = await this.getCurrentBranch();
      if (name === currentBranch) {
        throw new Error('Cannot delete the current branch');
      }

      this.logger.log(`Deleting branch: ${name}${force ? ' (force)' : ''}`);
      
      if (force) {
        await this.git.branch(['-D', name]);
      } else {
        await this.git.deleteLocalBranch(name);
      }
      
      this.logger.log(`Successfully deleted branch: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to delete branch: ${name}`, error);
      throw error;
    }
  }

  private validateBranchName(name: string): void {
    const branchNameRegex = /^[a-zA-Z0-9/_-]+$/;
    
    if (!name || name.trim().length === 0) {
      throw new Error('Branch name cannot be empty');
    }
    
    if (!branchNameRegex.test(name)) {
      throw new Error('Branch name contains invalid characters. Only alphanumeric characters, hyphens, underscores, and forward slashes are allowed');
    }
    
    if (name.includes('..')) {
      throw new Error('Branch name cannot contain ".."');
    }
    
    if (name.startsWith('-')) {
      throw new Error('Branch name cannot start with a hyphen');
    }
    
    if (name.endsWith('.lock')) {
      throw new Error('Branch name cannot end with ".lock"');
    }
    
    if (name.length > 255) {
      throw new Error('Branch name cannot exceed 255 characters');
    }
  }

  getNotesPath(): string {
    return path.resolve(this.notesPath);
  }

  async getCommitDetails(hash: string): Promise<CommitDetailsDto> {
    try {
      this.logger.log(`Getting commit details for: ${hash}`);
      
      // Get commit information using show command instead of log
      const showResult = await this.git.show([hash, '--format=%H|%an <%ae>|%ai|%s|%D', '--no-patch']);
      
      if (!showResult || showResult.trim().length === 0) {
        throw new Error(`Commit ${hash} not found`);
      }

      // Parse the show result
      const parts = showResult.trim().split('|');
      if (parts.length < 4) {
        throw new Error(`Invalid commit format for ${hash}`);
      }

      const commit = {
        hash: parts[0],
        author: parts[1],
        date: parts[2],
        message: parts[3],
        refs: parts[4] || undefined
      };

      // Get diff stats
      const diffSummary = await this.git.diffSummary([`${hash}^`, hash]);
      
      // Get full diff with context
      const diffResult = await this.git.diff([`${hash}^`, hash]);
      
      // Parse the diff
      const files = this.parseDiff(diffResult, diffSummary.files);

      const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
      const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

      this.logger.log(`Retrieved details for commit ${hash.substring(0, 7)}: ${files.length} files changed`);

      return new CommitDetailsDto({
        hash: commit.hash,
        author: commit.author,
        date: commit.date,
        message: commit.message,
        refs: commit.refs,
        filesChanged: files.length,
        additions: totalAdditions,
        deletions: totalDeletions,
        files
      });
    } catch (error) {
      this.logger.error(`Failed to get commit details for ${hash}`, error);
      throw error;
    }
  }

  private parseDiff(diffOutput: string, fileSummary: any[]): FileDiffEntity[] {
    const files: FileDiffEntity[] = [];
    
    // Handle empty diff output
    if (!diffOutput || diffOutput.trim().length === 0) {
      return files;
    }
    
    const fileDiffs = diffOutput.split(/^diff --git /m).filter(Boolean);

    for (const fileDiff of fileDiffs) {
      const lines = fileDiff.split('\n');
      
      // Extract file path from the first line (e.g., "a/path/to/file b/path/to/file")
      const pathMatch = lines[0].match(/a\/(.*?) b\/(.*)/);
      if (!pathMatch) continue;
      
      const filePath = pathMatch[2];
      
      // Find stats for this file
      const stats = fileSummary.find(f => f.file === filePath);
      const additions = stats?.insertions || 0;
      const deletions = stats?.deletions || 0;

      // Parse chunks
      const chunks = this.parseChunks(lines);

      files.push(new FileDiffEntity({
        path: filePath,
        additions,
        deletions,
        chunks
      }));
    }

    return files;
  }

  private parseChunks(lines: string[]): DiffChunk[] {
    const chunks: DiffChunk[] = [];
    let currentChunk: DiffChunk | null = null;
    let oldLineNum = 0;
    let newLineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect chunk header (e.g., "@@ -10,7 +10,8 @@")
      const chunkMatch = line.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);
      if (chunkMatch) {
        // Save previous chunk
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // Start new chunk
        const oldStart = parseInt(chunkMatch[1], 10);
        const oldLines = chunkMatch[2] ? parseInt(chunkMatch[2], 10) : 1;
        const newStart = parseInt(chunkMatch[3], 10);
        const newLines = chunkMatch[4] ? parseInt(chunkMatch[4], 10) : 1;

        oldLineNum = oldStart;
        newLineNum = newStart;

        currentChunk = {
          oldStart,
          oldLines,
          newStart,
          newLines,
          lines: []
        };
        continue;
      }

      // Parse diff lines (only if we're in a chunk)
      if (currentChunk && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
        const diffLine: DiffLine = {
          type: line[0] === '+' ? 'add' : line[0] === '-' ? 'remove' : 'context',
          content: line.substring(1),
          oldLineNumber: line[0] !== '+' ? oldLineNum : undefined,
          newLineNumber: line[0] !== '-' ? newLineNum : undefined
        };

        currentChunk.lines.push(diffLine);

        // Update line numbers
        if (line[0] !== '+') oldLineNum++;
        if (line[0] !== '-') newLineNum++;
      }
    }

    // Save last chunk
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}
