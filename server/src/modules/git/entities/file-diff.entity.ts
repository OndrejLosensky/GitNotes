export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export class FileDiffEntity {
  path: string;
  additions: number;
  deletions: number;
  chunks: DiffChunk[];

  constructor(partial: Partial<FileDiffEntity>) {
    Object.assign(this, partial);
  }
}

