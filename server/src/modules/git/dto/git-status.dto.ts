import { GitFileStatusEntity } from '../entities/git-file-status.entity';

export class GitStatusDto {
  modified: GitFileStatusEntity[];
  staged: GitFileStatusEntity[];
  untracked: GitFileStatusEntity[];
  deleted: GitFileStatusEntity[];
  branch: string;
  ahead: number;
  behind: number;

  constructor(partial: Partial<GitStatusDto>) {
    Object.assign(this, partial);
  }
}
