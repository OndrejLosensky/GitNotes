import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { GitService } from '../git/git.service';
import * as fs from 'fs';
import * as path from 'path';
import { NoteEntity } from './entities/note.entity';
import {
  NoteListDto,
  NoteContentDto,
  CreateNoteDto,
  UpdateNoteDto,
} from './dto';
import { FilePathValidator } from '../../common/utils/file-path-validator.util';
import { ERROR_MESSAGES } from '../../core/constants/error-messages.const';
import { APP_CONSTANTS } from '../../core/constants/app.const';
import { GitStatusDto } from '../git/dto/git-status.dto';
import { GitFileStatusEntity } from '../git/entities/git-file-status.entity';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private gitService: GitService) {}

  async getNotes(): Promise<NoteListDto> {
    const notesPath = this.gitService.getNotesPath();

    try {
      const notes = await this.readMarkdownFiles(notesPath);

      // Get git status for all files
      const gitStatus: GitStatusDto = await this.gitService.getStatus();

      // Create a map of file paths to their git status
      const statusMap = new Map<
        string,
        'unmodified' | 'modified' | 'untracked' | 'staged'
      >();

      // Mark staged files first (highest priority)
      gitStatus.staged.forEach((file: GitFileStatusEntity) => {
        statusMap.set(file.path, 'staged');
      });

      // Mark modified files (only if not already staged)
      gitStatus.modified.forEach((file: GitFileStatusEntity) => {
        if (!statusMap.has(file.path)) {
          statusMap.set(file.path, 'modified');
        }
      });

      // Mark untracked files (only if not already staged)
      gitStatus.untracked.forEach((file: GitFileStatusEntity) => {
        if (!statusMap.has(file.path)) {
          statusMap.set(file.path, 'untracked');
        }
      });

      // Update notes with their git status
      notes.forEach((note: NoteEntity) => {
        note.gitStatus = statusMap.get(note.path) || 'unmodified';
      });

      this.logger.log(`Found ${notes.length} markdown files with git status`);
      return new NoteListDto(notes);
    } catch (error) {
      this.logger.error('Failed to read notes', error);
      throw error;
    }
  }

  async getNoteContent(filePath: string): Promise<NoteContentDto> {
    const notesPath = this.gitService.getNotesPath();

    // Validate the path to prevent directory traversal
    let validatedPath: string;
    try {
      validatedPath = FilePathValidator.validatePath(filePath, notesPath);
    } catch {
      this.logger.warn(`Invalid path requested: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if file exists
    if (!fs.existsSync(validatedPath)) {
      this.logger.warn(`Note not found: ${filePath}`);
      throw new NotFoundException(ERROR_MESSAGES.NOTE_NOT_FOUND);
    }

    // Check if it's a file (not a directory)
    const stats = fs.statSync(validatedPath);
    if (!stats.isFile()) {
      this.logger.warn(`Path is not a file: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if it's a markdown file
    if (!validatedPath.endsWith(APP_CONSTANTS.MARKDOWN_EXTENSION)) {
      this.logger.warn(`File is not a markdown file: ${filePath}`);
      throw new BadRequestException('Only markdown files (.md) are supported');
    }

    // Check file size
    if (stats.size > APP_CONSTANTS.MAX_NOTE_SIZE_BYTES) {
      this.logger.warn(
        `File too large: ${filePath} (${stats.size} bytes, max: ${APP_CONSTANTS.MAX_NOTE_SIZE_BYTES})`,
      );
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${APP_CONSTANTS.MAX_NOTE_SIZE_MB}MB`,
      );
    }

    // Read file content
    let content: string;
    try {
      content = fs.readFileSync(validatedPath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read note: ${filePath}`, error);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOTE_READ_ERROR);
    }

    // Create note entity with metadata
    const fileName = path.basename(validatedPath);
    const relativePath = path.relative(notesPath, validatedPath);

    // Get git status for this specific file
    const gitStatus = await this.gitService.getStatus();
    const statusMap = new Map<
      string,
      'unmodified' | 'modified' | 'untracked' | 'staged'
    >();

    // Mark staged files first (highest priority)
    gitStatus.staged.forEach((file: GitFileStatusEntity) => {
      statusMap.set(file.path, 'staged');
    });

    // Mark modified files (only if not already staged)
    gitStatus.modified.forEach((file: GitFileStatusEntity) => {
      if (!statusMap.has(file.path)) {
        statusMap.set(file.path, 'modified');
      }
    });

    // Mark untracked files (only if not already staged)
    gitStatus.untracked.forEach((file: GitFileStatusEntity) => {
      if (!statusMap.has(file.path)) {
        statusMap.set(file.path, 'untracked');
      }
    });

    const noteEntity = new NoteEntity({
      name: fileName,
      path: relativePath,
      size: stats.size,
      modifiedDate: stats.mtime,
      gitStatus: statusMap.get(relativePath) || 'unmodified',
    });

    this.logger.log(`Successfully read note: ${filePath}`);
    return new NoteContentDto(noteEntity, content);
  }

  createNote(dto: CreateNoteDto): NoteEntity {
    const notesPath = this.gitService.getNotesPath();

    // Validate filename
    FilePathValidator.validateFileName(dto.name);

    // Validate the path
    let validatedPath: string;
    try {
      validatedPath = FilePathValidator.validatePath(
        dto.path ? path.join(dto.path, dto.name) : dto.name,
        notesPath,
      );
    } catch {
      this.logger.warn(
        `Invalid path for note creation: ${dto.path}/${dto.name}`,
      );
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if file already exists
    if (fs.existsSync(validatedPath)) {
      this.logger.warn(`Note already exists: ${validatedPath}`);
      throw new ConflictException('Note already exists at this path');
    }

    // Check content size
    const contentSize = Buffer.byteLength(dto.content, 'utf-8');
    if (contentSize > APP_CONSTANTS.MAX_NOTE_SIZE_BYTES) {
      throw new BadRequestException(
        `Content size exceeds maximum allowed size of ${APP_CONSTANTS.MAX_NOTE_SIZE_MB}MB`,
      );
    }

    // Create parent directories if they don't exist
    const parentDir = path.dirname(validatedPath);
    if (!fs.existsSync(parentDir)) {
      try {
        fs.mkdirSync(parentDir, { recursive: true });
        this.logger.log(`Created directory: ${parentDir}`);
      } catch (error) {
        this.logger.error(`Failed to create directory: ${parentDir}`, error);
        throw new InternalServerErrorException(ERROR_MESSAGES.NOTE_WRITE_ERROR);
      }
    }

    // Write file
    try {
      fs.writeFileSync(validatedPath, dto.content, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to create note: ${validatedPath}`, error);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOTE_WRITE_ERROR);
    }

    // Get file stats
    const stats = fs.statSync(validatedPath);
    const relativePath = path.relative(notesPath, validatedPath);

    const noteEntity = new NoteEntity({
      name: dto.name,
      path: relativePath,
      size: stats.size,
      modifiedDate: stats.mtime,
      gitStatus: 'untracked', // New file, not yet committed
    });

    this.logger.log(`Successfully created note: ${relativePath}`);
    return noteEntity;
  }

  updateNote(filePath: string, dto: UpdateNoteDto): NoteEntity {
    const notesPath = this.gitService.getNotesPath();

    // Validate the path
    let validatedPath: string;
    try {
      validatedPath = FilePathValidator.validatePath(filePath, notesPath);
    } catch {
      this.logger.warn(`Invalid path for note update: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if file exists
    if (!fs.existsSync(validatedPath)) {
      this.logger.warn(`Note not found for update: ${filePath}`);
      throw new NotFoundException(ERROR_MESSAGES.NOTE_NOT_FOUND);
    }

    // Check if it's a file
    const existingStats = fs.statSync(validatedPath);
    if (!existingStats.isFile()) {
      this.logger.warn(`Path is not a file: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if it's a markdown file
    if (!validatedPath.endsWith(APP_CONSTANTS.MARKDOWN_EXTENSION)) {
      throw new BadRequestException('Only markdown files (.md) are supported');
    }

    // Check content size
    const contentSize = Buffer.byteLength(dto.content, 'utf-8');
    if (contentSize > APP_CONSTANTS.MAX_NOTE_SIZE_BYTES) {
      throw new BadRequestException(
        `Content size exceeds maximum allowed size of ${APP_CONSTANTS.MAX_NOTE_SIZE_MB}MB`,
      );
    }

    // Update file
    try {
      fs.writeFileSync(validatedPath, dto.content, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to update note: ${filePath}`, error);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOTE_WRITE_ERROR);
    }

    // Get updated file stats
    const stats = fs.statSync(validatedPath);
    const fileName = path.basename(validatedPath);
    const relativePath = path.relative(notesPath, validatedPath);

    const noteEntity = new NoteEntity({
      name: fileName,
      path: relativePath,
      size: stats.size,
      modifiedDate: stats.mtime,
      gitStatus: 'modified',
    });

    this.logger.log(`Successfully updated note: ${relativePath}`);
    return noteEntity;
  }

  deleteNote(filePath: string): { message: string; path: string } {
    const notesPath = this.gitService.getNotesPath();

    // Validate the path
    let validatedPath: string;
    try {
      validatedPath = FilePathValidator.validatePath(filePath, notesPath);
    } catch {
      this.logger.warn(`Invalid path for note deletion: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if file exists
    if (!fs.existsSync(validatedPath)) {
      this.logger.warn(`Note not found for deletion: ${filePath}`);
      throw new NotFoundException(ERROR_MESSAGES.NOTE_NOT_FOUND);
    }

    // Check if it's a file
    const stats = fs.statSync(validatedPath);
    if (!stats.isFile()) {
      this.logger.warn(`Path is not a file: ${filePath}`);
      throw new BadRequestException(ERROR_MESSAGES.NOTE_INVALID_PATH);
    }

    // Check if it's a markdown file
    if (!validatedPath.endsWith(APP_CONSTANTS.MARKDOWN_EXTENSION)) {
      throw new BadRequestException('Only markdown files (.md) are supported');
    }

    // Delete file
    try {
      fs.unlinkSync(validatedPath);
    } catch (error) {
      this.logger.error(`Failed to delete note: ${filePath}`, error);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOTE_DELETE_ERROR);
    }

    const relativePath = path.relative(notesPath, validatedPath);
    this.logger.log(`Successfully deleted note: ${relativePath}`);

    return {
      message: 'Note deleted successfully',
      path: relativePath,
    };
  }

  private async readMarkdownFiles(
    dirPath: string,
    basePath: string = dirPath,
  ): Promise<NoteEntity[]> {
    const notes: NoteEntity[] = [];

    if (!fs.existsSync(dirPath)) {
      return notes;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // Skip .git directory
      if (entry.name === '.git') {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively read subdirectories
        const subFiles = await this.readMarkdownFiles(fullPath, basePath);
        notes.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Add markdown files with metadata
        const relativePath = path.relative(basePath, fullPath);
        const stats = fs.statSync(fullPath);

        notes.push(
          new NoteEntity({
            name: entry.name,
            path: relativePath,
            size: stats.size,
            modifiedDate: stats.mtime,
            gitStatus: 'unmodified', // Will be updated by getNotes()
          }),
        );
      }
    }

    return notes;
  }
}
