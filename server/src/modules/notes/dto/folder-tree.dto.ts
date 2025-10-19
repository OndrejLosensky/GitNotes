export class FolderTreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FolderTreeNode[];
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';

  constructor(partial: Partial<FolderTreeNode>) {
    Object.assign(this, partial);
  }
}

export class FolderTreeDto {
  tree: FolderTreeNode[];

  constructor(tree: FolderTreeNode[]) {
    this.tree = tree;
  }
}
