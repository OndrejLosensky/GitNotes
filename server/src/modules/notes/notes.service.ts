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
  FolderTreeDto,
  FolderTreeNode,
  CreateFolderDto,
  SearchResultDto,
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

  getNotesPath(): string {
    return this.gitService.getNotesPath();
  }

  async getFolderTree(): Promise<FolderTreeDto> {
    const notesPath = this.gitService.getNotesPath();

    try {
      this.logger.log('Building folder tree structure');
      
      // Get git status for all files
      const gitStatus: GitStatusDto = await this.gitService.getStatus();
      const statusMap = new Map<string, 'unmodified' | 'modified' | 'untracked' | 'staged'>();
      
      // Build status map
      gitStatus.staged.forEach((file: GitFileStatusEntity) => {
        statusMap.set(file.path, 'staged');
      });
      gitStatus.modified.forEach((file: GitFileStatusEntity) => {
        if (!statusMap.has(file.path)) statusMap.set(file.path, 'modified');
      });
      gitStatus.untracked.forEach((file: GitFileStatusEntity) => {
        if (!statusMap.has(file.path)) statusMap.set(file.path, 'untracked');
      });

      const tree = await this.buildFolderTree(notesPath, '', statusMap);
      
      this.logger.log(`Built folder tree with ${this.countNodes(tree)} total items`);
      
      return new FolderTreeDto(tree);
    } catch (error) {
      this.logger.error('Failed to build folder tree', error);
      throw new InternalServerErrorException(
        `${ERROR_MESSAGES.FOLDER_TREE_ERROR}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async buildFolderTree(
    basePath: string,
    relativePath: string,
    statusMap: Map<string, 'unmodified' | 'modified' | 'untracked' | 'staged'>
  ): Promise<FolderTreeNode[]> {
    const fullPath = relativePath ? path.join(basePath, relativePath) : basePath;
    
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      return [];
    }

    const items = fs.readdirSync(fullPath);
    const tree: FolderTreeNode[] = [];

    // Separate directories and files
    const directories: string[] = [];
    const files: string[] = [];

    for (const item of items) {
      if (item.startsWith('.')) continue; // Skip hidden files/folders
      
      const itemPath = relativePath ? path.join(relativePath, item) : item;
      const fullItemPath = path.join(basePath, itemPath);
      
      if (fs.statSync(fullItemPath).isDirectory()) {
        directories.push(item);
      } else if (item.endsWith('.md')) {
        files.push(item);
      }
    }

    // Add directories first
    for (const dir of directories.sort()) {
      const dirPath = relativePath ? path.join(relativePath, dir) : dir;
      const children = await this.buildFolderTree(basePath, dirPath, statusMap);
      
      tree.push(new FolderTreeNode({
        name: dir,
        type: 'folder',
        path: dirPath,
        children: children,
      }));
    }

    // Add files
    for (const file of files.sort()) {
      const filePath = relativePath ? path.join(relativePath, file) : file;
      const gitStatus = statusMap.get(filePath) || 'unmodified';
      
      tree.push(new FolderTreeNode({
        name: file,
        type: 'file',
        path: filePath,
        gitStatus: gitStatus,
      }));
    }

    return tree;
  }

  private countNodes(nodes: FolderTreeNode[]): number {
    let count = nodes.length;
    for (const node of nodes) {
      if (node.children) {
        count += this.countNodes(node.children);
      }
    }
    return count;
  }

  async createFolder(createFolderDto: CreateFolderDto): Promise<{ success: boolean; message: string }> {
    try {
      const { name, parentPath = '' } = createFolderDto;
      
      // Validate folder name
      if (!FilePathValidator.isValidFolderName(name)) {
        throw new BadRequestException('Invalid folder name');
      }

      const notesPath = this.gitService.getNotesPath();
      const fullParentPath = parentPath ? path.join(notesPath, parentPath) : notesPath;
      const newFolderPath = path.join(fullParentPath, name);

      // Check if parent path exists
      if (!fs.existsSync(fullParentPath)) {
        throw new NotFoundException('Parent folder does not exist');
      }

      // Check if folder already exists
      if (fs.existsSync(newFolderPath)) {
        throw new ConflictException('Folder already exists');
      }

      // Create the folder
      fs.mkdirSync(newFolderPath, { recursive: true });

      this.logger.log(`Created folder: ${path.join(parentPath, name)}`);

      return {
        success: true,
        message: `Successfully created folder: ${path.join(parentPath, name)}`,
      };
    } catch (error) {
      this.logger.error('Failed to create folder', error);
      
      if (error instanceof BadRequestException || 
          error instanceof NotFoundException || 
          error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException(
        `${ERROR_MESSAGES.FOLDER_CREATE_ERROR}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async searchNotes(query: string, folderPath?: string): Promise<SearchResultDto[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const notesPath = this.gitService.getNotesPath();
      const searchPath = folderPath ? path.join(notesPath, folderPath) : notesPath;
      
      if (!fs.existsSync(searchPath)) {
        return [];
      }

      const results: SearchResultDto[] = [];
      const searchRegex = new RegExp(query.trim(), 'gi');

      // Recursively search through files
      await this.searchInDirectory(searchPath, searchRegex, results, notesPath);

      // Sort by match count (relevance) and limit results
      return results
        .sort((a, b) => b.matches - a.matches)
        .slice(0, 50);
    } catch (error) {
      this.logger.error('Failed to search notes', error);
      throw new InternalServerErrorException('Search failed');
    }
  }

  private async searchInDirectory(
    dirPath: string,
    searchRegex: RegExp,
    results: SearchResultDto[],
    basePath: string,
  ): Promise<void> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          await this.searchInDirectory(fullPath, searchRegex, results, basePath);
        } else if (entry.isFile() && this.isMarkdownFile(entry.name)) {
          // Search in markdown files
          await this.searchInFile(fullPath, relativePath, searchRegex, results);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to read directory: ${dirPath}`, error);
    }
  }

  private async searchInFile(
    filePath: string,
    relativePath: string,
    searchRegex: RegExp,
    results: SearchResultDto[],
  ): Promise<void> {
    try {
      // Skip large files (>1MB)
      const stats = fs.statSync(filePath);
      if (stats.size > 1024 * 1024) {
        return;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(searchRegex);

      if (matches && matches.length > 0) {
        // Find the first match and create a snippet
        const firstMatchIndex = content.toLowerCase().indexOf(matches[0].toLowerCase());
        const snippetStart = Math.max(0, firstMatchIndex - 50);
        const snippetEnd = Math.min(content.length, firstMatchIndex + matches[0].length + 50);
        const snippet = content.substring(snippetStart, snippetEnd);

        results.push(new SearchResultDto({
          path: relativePath.replace(/\\/g, '/'), // Normalize path separators
          name: path.basename(relativePath),
          snippet: snippet.trim(),
          matches: matches.length,
        }));
      }
    } catch (error) {
      this.logger.warn(`Failed to search in file: ${filePath}`, error);
    }
  }

  private isMarkdownFile(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.md');
  }
}
