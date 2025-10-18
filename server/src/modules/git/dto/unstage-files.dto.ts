import { IsArray, IsNotEmpty } from 'class-validator';

export class UnstageFilesDto {
  @IsArray()
  @IsNotEmpty()
  files: string[];
}

