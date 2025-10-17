export const APP_CONSTANTS = {
  // API
  API_PREFIX: 'api',
  API_VERSION: 'v1',

  // File Extensions
  MARKDOWN_EXTENSION: '.md',
  ALLOWED_FILE_EXTENSIONS: ['.md', '.txt'],

  // Files
  MAX_NOTE_SIZE_MB: 10, // Maximum note file size in MB
  MAX_NOTE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB in bytes

  // Git
  DEFAULT_BRANCH: 'main',
  GIT_DIRECTORY: '.git',

  // Auth
  JWT_EXPIRATION: '24h',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
