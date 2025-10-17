export interface NoteMetadata {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: Date;
  gitStatus?: 'clean' | 'modified' | 'untracked';
}

export interface NoteContent extends NoteMetadata {
  content: string;
}
