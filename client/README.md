# GitNotes Client

React frontend for the GitNotes application.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. The client is configured to connect to the backend at `http://localhost:3001`

## Running

Development mode:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

Build for production:
```bash
pnpm build
```

Preview production build:
```bash
pnpm preview
```

## Features

- **Login Page**: Simple password authentication
- **Notes List**: View all markdown files from your GitHub repository
- **Pull Latest**: Manually sync with GitHub to get new notes

## Usage

1. Start the backend server first
2. Run the frontend with `pnpm dev`
3. Navigate to `http://localhost:5173`
4. Login with your configured password
5. View your notes and use "Pull Latest" to sync from GitHub

