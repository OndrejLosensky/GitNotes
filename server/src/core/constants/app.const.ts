export const APP_CONSTANTS = {
  // API
  API_PREFIX: 'api',
  API_VERSION: 'v1',

  // File Extensions
  MARKDOWN_EXTENSION: '.md',
  ALLOWED_FILE_EXTENSIONS: ['.md', '.txt'],

  // Git
  DEFAULT_BRANCH: 'main',
  GIT_DIRECTORY: '.git',

  // Auth
  JWT_EXPIRATION: '24h',

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
