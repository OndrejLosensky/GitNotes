export class GitFileStatusEntity {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
  workingDir: string; // Working directory status
  index: string; // Staging area status

  constructor(partial: Partial<GitFileStatusEntity>) {
    Object.assign(this, partial);
  }
}
