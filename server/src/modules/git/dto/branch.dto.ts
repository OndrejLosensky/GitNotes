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

export class CreateBranchDto {
  name: string;
  from?: string;
}

export class CheckoutBranchDto {
  branch: string;
}

export class DeleteBranchDto {
  name: string;
  force?: boolean;
}
