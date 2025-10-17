import { NoteEntity } from '../entities/note.entity';

export class NoteListDto {
  notes: NoteEntity[];
  total: number;

  constructor(notes: NoteEntity[]) {
    this.notes = notes;
    this.total = notes.length;
  }
}
