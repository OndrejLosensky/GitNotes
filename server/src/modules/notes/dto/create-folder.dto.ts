import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty({ message: 'Folder name is required' })
  name: string;

  @IsOptional()
  @IsString()
  parentPath?: string; // Path of parent folder (empty for root)
}
