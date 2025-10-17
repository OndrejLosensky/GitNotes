import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GitService } from '../git/git.service';
import * as fs from 'fs';
import * as path from 'path';
import { NoteEntity } from './entities/note.entity';
import { NoteListDto, NoteContentDto } from './dto';
import { FilePathValidator } from '../../common/utils/file-path-validator.util';
import { ERROR_MESSAGES } from '../../core/constants/error-messages.const';
import { APP_CONSTANTS } from '../../core/constants/app.const';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private gitService: GitService) {}

  async getNotes(): Promise<NoteListDto> {
    const notesPath = this.gitService.getNotesPath();

    try {
      const notes = await this.readMarkdownFiles(notesPath);
      this.logger.log(`Found ${notes.length} markdown files`);
      return new NoteListDto(notes);
    } catch (error) {
      this.logger.error('Failed to read notes', error);
      throw error;
    }
  }

  getNoteContent(filePath: string): NoteContentDto {
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

    const noteEntity = new NoteEntity({
      name: fileName,
      path: relativePath,
      size: stats.size,
      modifiedDate: stats.mtime,
      gitStatus: 'clean', // Will be implemented in future phase
    });

    this.logger.log(`Successfully read note: ${filePath}`);
    return new NoteContentDto(noteEntity, content);
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
            gitStatus: 'clean', // TODO: Get actual git status
          }),
        );
      }
    }

    return notes;
  }
}
