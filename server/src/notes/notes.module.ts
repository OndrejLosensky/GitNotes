import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { GitModule } from '../git/git.module';

@Module({
  imports: [GitModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
