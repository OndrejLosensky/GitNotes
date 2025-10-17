import { CommitEntity } from '../entities/commit.entity';

export class GitHistoryDto {
  commits: CommitEntity[];
  total: number;

  constructor(commits: CommitEntity[]) {
    this.commits = commits;
    this.total = commits.length;
  }
}
