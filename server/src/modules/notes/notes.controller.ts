import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NoteListDto, NoteContentDto } from './dto';

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
  getNoteContent(@Req() request: Request): NoteContentDto {
    // Extract the path after 'content/'
    const fullPath = request.path;
    const contentPrefix = '/api/notes/content/';
    const filePath = fullPath.startsWith(contentPrefix)
      ? fullPath.substring(contentPrefix.length)
      : fullPath.split('content/')[1] || '';

    return this.notesService.getNoteContent(filePath);
  }
}
