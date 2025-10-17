export class PullResultDto {
  success: boolean;
  message: string;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;

  constructor(partial: Partial<PullResultDto>) {
    Object.assign(this, partial);
  }
}
