export class BranchDto {
  name: string;
  current: boolean;
  commit: string;
  label?: string;

  constructor(partial: Partial<BranchDto>) {
    Object.assign(this, partial);
  }
}

export class BranchListDto {
  branches: BranchDto[];
  current: string;

  constructor(branches: BranchDto[], current: string) {
    this.branches = branches;
    this.current = current;
  }
}
