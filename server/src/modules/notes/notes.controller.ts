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

  @Delete('*')
  @HttpCode(HttpStatus.OK)
  deleteNote(@Req() request: Request): { message: string; path: string } {
    // Extract the path after 'notes/'
    const fullPath = request.path;
    const notesPrefix = '/api/notes/';
    const filePath = fullPath.startsWith(notesPrefix)
      ? fullPath.substring(notesPrefix.length)
      : fullPath.split('notes/')[1] || '';

    return this.notesService.deleteNote(filePath);
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
}
