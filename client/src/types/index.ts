// Shared TypeScript interfaces and types

export interface Note {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: string;
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';
  content?: string;
}

export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: GitFileStatus[];
  staged: GitFileStatus[];
  untracked: GitFileStatus[];
  deleted: GitFileStatus[];
}

export interface GitFileStatus {
  path: string;
  status: string;
}

export interface CommitInfo {
  hash: string;
  author: string;
  message: string;
  date: string;
}

export type TabType = 'notes' | 'git';
