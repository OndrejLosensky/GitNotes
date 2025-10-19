export const ERROR_MESSAGES = {
  // Auth
  AUTH_INVALID_PASSWORD: 'Invalid password',
  AUTH_PASSWORD_NOT_CONFIGURED: 'AUTH_PASSWORD is not configured',
  AUTH_UNAUTHORIZED: 'Unauthorized access',

  // Notes
  NOTE_NOT_FOUND: 'Note not found',
  NOTE_INVALID_PATH: 'Invalid note path',
  NOTE_READ_ERROR: 'Failed to read note',
  NOTE_WRITE_ERROR: 'Failed to write note',
  NOTE_DELETE_ERROR: 'Failed to delete note',

  // Git
  GIT_CLONE_ERROR: 'Failed to clone repository',
  GIT_PULL_ERROR: 'Failed to pull latest changes',
  GIT_PUSH_ERROR: 'Failed to push changes',
  GIT_COMMIT_ERROR: 'Failed to commit changes',
  GIT_STATUS_ERROR: 'Failed to get git status',
  GIT_REPO_NOT_CONFIGURED: 'Git repository is not configured',

  // Config
  CONFIG_MISSING_ENV: 'Required environment variable is missing',

  // Folders
  FOLDER_TREE_ERROR: 'Failed to build folder tree',
  FOLDER_CREATE_ERROR: 'Failed to create folder',
} as const;
