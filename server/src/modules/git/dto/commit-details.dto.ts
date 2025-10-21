import { FileDiffEntity } from '../entities/file-diff.entity';

export class CommitDetailsDto {
  hash: string;
  author: string;
  date: string;
  message: string;
  refs?: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  files: FileDiffEntity[];

  constructor(partial: Partial<CommitDetailsDto>) {
    Object.assign(this, partial);
  }
}

