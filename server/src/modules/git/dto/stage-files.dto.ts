import { IsArray, IsBoolean, IsOptional, ValidateIf } from 'class-validator';

export class StageFilesDto {
  @IsOptional()
  @IsArray()
  files?: string[];

  @IsOptional()
  @IsBoolean()
  all?: boolean;

  @ValidateIf((o) => !o.files && !o.all)
  validate() {
    if (!this.files && !this.all) {
      throw new Error('Either files or all must be provided');
    }
  }
}

