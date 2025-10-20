import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  NoteListDto,
  NoteContentDto,
  CreateNoteDto,
  UpdateNoteDto,
  FolderTreeDto,
  CreateFolderDto,
  SearchResultDto,
} from './dto';
import { NoteEntity } from './entities/note.entity';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotes(): Promise<NoteListDto> {
    return this.notesService.getNotes();
  }

  @Get('content/*')
  @HttpCode(HttpStatus.OK)
  async getNoteContent(@Req() request: Request): Promise<NoteContentDto> {
    // Extract the path after 'content/'
    const fullPath = request.path;
    const contentPrefix = '/api/notes/content/';
    const filePath = fullPath.startsWith(contentPrefix)
      ? fullPath.substring(contentPrefix.length)
      : fullPath.split('content/')[1] || '';

    return await this.notesService.getNoteContent(filePath);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createNote(@Body() createNoteDto: CreateNoteDto): NoteEntity {
    return this.notesService.createNote(createNoteDto);
  }

  @Put('*')
  @HttpCode(HttpStatus.OK)
  updateNote(
    @Req() request: Request,
    @Body() updateNoteDto: UpdateNoteDto,
  ): NoteEntity {
    // Extract the path after 'notes/'
    const fullPath = request.path;
    const notesPrefix = '/api/notes/';
    const filePath = fullPath.startsWith(notesPrefix)
      ? fullPath.substring(notesPrefix.length)
      : fullPath.split('notes/')[1] || '';

    return this.notesService.updateNote(filePath, updateNoteDto);
  }


  @Get('tree')
  @HttpCode(HttpStatus.OK)
  async getFolderTree(): Promise<FolderTreeDto> {
    return await this.notesService.getFolderTree();
  }

  @Post('folders')
  @HttpCode(HttpStatus.OK)
  async createFolder(@Body() createFolderDto: CreateFolderDto): Promise<{ success: boolean; message: string }> {
    return await this.notesService.createFolder(createFolderDto);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchNotes(
    @Query('q') query: string,
    @Query('folder') folder?: string,
  ): Promise<SearchResultDto[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    return await this.notesService.searchNotes(query.trim(), folder);
  }

  @Delete('*')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteItem(@Req() request: Request): Promise<void> {
    // Extract the path after 'notes/'
    const fullPath = request.path;
    const notesPrefix = '/api/notes/';
    const itemPath = fullPath.startsWith(notesPrefix)
      ? fullPath.substring(notesPrefix.length)
      : fullPath.split('notes/')[1] || '';
    
    if (!itemPath) {
      throw new BadRequestException('Path is required');
    }

    // Check if it's a file or folder by checking the extension
    if (itemPath.endsWith('.md')) {
      this.notesService.deleteNote(itemPath);
    } else {
      this.notesService.deleteFolder(itemPath);
    }
  }
}
