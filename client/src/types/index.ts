// Shared TypeScript interfaces and types

export interface Note {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: string;
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged' | 'added' | 'deleted';
  content?: string;
}

export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged' | 'added' | 'deleted';
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

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
}

export interface CommitDetails {
  hash: string;
  author: string;
  date: string;
  message: string;
  refs?: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  files: FileDiff[];
}

export interface Branch {
  name: string;
  current: boolean;
  commit: string;
  label?: string;
}

export interface BranchList {
  branches: Branch[];
  current: string;
}

export interface SearchResult {
  path: string;
  name: string;
  snippet: string;
  matches: number;
}

export type TabType = 'notes' | 'git';
