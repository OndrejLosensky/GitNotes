export class NoteEntity {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: Date;
  gitStatus?: 'clean' | 'modified' | 'untracked';

  constructor(partial: Partial<NoteEntity>) {
    Object.assign(this, partial);
  }
}
