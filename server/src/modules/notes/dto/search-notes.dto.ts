export class SearchResultDto {
  path: string;
  name: string;
  snippet: string;
  matches: number;

  constructor(partial: Partial<SearchResultDto>) {
    Object.assign(this, partial);
  }
}

export class SearchNotesDto {
  q: string;
  folder?: string;
}
