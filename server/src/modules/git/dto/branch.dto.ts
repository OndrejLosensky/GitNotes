import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
  @IsString()
  @IsNotEmpty({ message: 'Branch name is required' })
  name: string;

  @IsOptional()
  @IsString()
  from?: string;
}

export class CheckoutBranchDto {
  @IsString()
  @IsNotEmpty({ message: 'Branch name is required' })
  branch: string;
}

export class DeleteBranchDto {
  name: string;
  force?: boolean;
}
