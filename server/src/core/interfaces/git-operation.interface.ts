export interface GitOperationResult {
  success: boolean;
  message: string;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
}

export interface GitCommitInfo {
  hash: string;
  author: string;
  date: string;
  message: string;
}
