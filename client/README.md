# GitNotes Client

React frontend application built with TypeScript and Vite.

## Overview

Modern, VSCode-like interface for managing markdown notes with Git integration.

## Key Features

- **Note Editor** - Markdown editing with syntax support
- **File Tree** - Hierarchical folder structure navigation
- **Search** - Find notes by title or content
- **Git Integration** - View history, commits, and changes
- **Real-time Preview** - Live markdown rendering

## Tech Stack

- React 18
- TypeScript
- Vite
- Context API
- CSS Modules

## Development

See [install.md](../install.md) for setup instructions.

## Project Structure

```
src/
├── components/     # UI components
│   ├── common/     # Shared components
│   ├── git/        # Git-related components
│   ├── notes/      # Note management
│   └── layout/     # Layout components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── contexts/       # Context providers
├── api/            # API client
└── styles/         # Global styles
```
