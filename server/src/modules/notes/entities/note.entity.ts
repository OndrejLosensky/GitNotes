export class NoteEntity {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: Date;
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';

  constructor(partial: Partial<NoteEntity>) {
    Object.assign(this, partial);
  }
}
