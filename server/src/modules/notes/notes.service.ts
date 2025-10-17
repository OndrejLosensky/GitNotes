import { Injectable, Logger } from '@nestjs/common';
import { GitService } from '../git/git.service';
import * as fs from 'fs';
import * as path from 'path';

export interface NoteFile {
  name: string;
  path: string;
}

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private gitService: GitService) {}

  async getNotes(): Promise<NoteFile[]> {
    const notesPath = this.gitService.getNotesPath();

    try {
      const files = await this.readMarkdownFiles(notesPath);
      this.logger.log(`Found ${files.length} markdown files`);
      return files;
    } catch (error) {
      this.logger.error('Failed to read notes', error);
      throw error;
    }
  }

  private async readMarkdownFiles(
    dirPath: string,
    basePath: string = dirPath,
  ): Promise<NoteFile[]> {
    const files: NoteFile[] = [];

    if (!fs.existsSync(dirPath)) {
      return files;
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
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Add markdown files
        const relativePath = path.relative(basePath, fullPath);
        files.push({
          name: entry.name,
          path: relativePath,
        });
      }
    }

    return files;
  }
}
