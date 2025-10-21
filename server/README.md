# GitNotes Server

NestJS backend API with Git integration and file-based note storage.

## Overview

RESTful API server handling authentication, note management, and Git operations.

## Key Features

- **Authentication** - JWT-based auth
- **Notes API** - CRUD operations for markdown files
- **Git Operations** - Status, commit, push, pull, branches
- **File System** - Direct markdown file storage
- **Real-time Sync** - Git repository synchronization

## Tech Stack

- NestJS
- TypeScript
- simple-git
- JWT/Passport
- Winston Logger

## Development

See [install.md](../install.md) for setup instructions.

## Project Structure

```
src/
├── modules/
│   ├── auth/        # Authentication
│   ├── notes/       # Note management
│   └── git/         # Git operations
├── common/          # Shared utilities
│   ├── filters/     # Exception filters
│   ├── interceptors/# Request/response interceptors
│   └── guards/      # Auth guards
└── config/          # Configuration
```

## API Documentation

See [api.md](./api.md) for endpoint documentation.
