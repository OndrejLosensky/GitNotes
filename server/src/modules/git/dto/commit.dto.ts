import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateCommitDto {
  @IsString()
  @IsNotEmpty({ message: 'Commit message is required' })
  message: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[]; // Specific files to commit (optional, commits all if empty)
}

export class CommitResponseDto {
  success: boolean;
  hash: string;
  message: string;

  constructor(success: boolean, hash: string, message: string) {
    this.success = success;
    this.hash = hash;
    this.message = message;
  }
}
