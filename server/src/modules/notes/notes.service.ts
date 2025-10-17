import { Injectable, Logger } from '@nestjs/common';
import { GitService } from '../git/git.service';
import * as fs from 'fs';
import * as path from 'path';
import { NoteEntity } from './entities/note.entity';
import { NoteListDto } from './dto';

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
