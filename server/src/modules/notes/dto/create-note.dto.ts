import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty({ message: 'Note name is required' })
  @Matches(/^[a-zA-Z0-9_-]+\.md$/, {
    message: 'Note name must be a valid markdown file (e.g., note.md)',
  })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsString()
  path?: string; // Optional: subdirectory path
}
