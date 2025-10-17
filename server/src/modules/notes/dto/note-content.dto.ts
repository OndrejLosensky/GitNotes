import { NoteEntity } from '../entities/note.entity';

export class NoteContentDto extends NoteEntity {
  content: string;

  constructor(note: NoteEntity, content: string) {
    super(note);
    this.content = content;
  }
}
