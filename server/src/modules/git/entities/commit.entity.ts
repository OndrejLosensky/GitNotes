export class CommitEntity {
  hash: string;
  author: string;
  date: string;
  message: string;
  refs?: string; // Branch/tag references

  constructor(partial: Partial<CommitEntity>) {
    Object.assign(this, partial);
  }
}
