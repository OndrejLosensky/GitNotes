# Installation Guide

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ondrejlosensky/gitnotes.git
cd gitnotes
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

### 3. Configure Server

Create `.env` file in the `server` directory:

```env
# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key-here
AUTH_PASSWORD=your-hashed-password

# Notes
NOTES_PATH=./data/notes

# Git (optional)
GIT_USER_NAME=GitNotes
GIT_USER_EMAIL=gitnotes@example.com
```

### 4. Generate Password Hash

```bash
cd server
pnpm ts-node scripts/hash-password.ts YourPasswordHere
```

Copy the output hash to `AUTH_PASSWORD` in `.env`

### 5. Start Development Servers

**Terminal 1 - Server:**
```bash
cd server
pnpm start:dev
```

**Terminal 2 - Client:**
```bash
cd client
pnpm dev
```

### 6. Access Application

Open browser to: `http://localhost:5173`

Login with the password you hashed in step 4.

## Production Build

### Build Client

```bash
cd client
pnpm build
```

### Build Server

```bash
cd server
pnpm build
```

### Run Production

```bash
cd server
pnpm start:prod
```

## Environment Variables

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT signing secret | Required |
| `AUTH_PASSWORD` | Hashed password | Required |
| `NOTES_PATH` | Notes storage path | `./data/notes` |
| `GIT_USER_NAME` | Git commit author | `GitNotes` |
| `GIT_USER_EMAIL` | Git commit email | `gitnotes@example.com` |

### Client

Client configuration is in `vite.config.ts`. API URL is set to `http://localhost:3001` by default.

## Troubleshooting

### Port Already in Use

Change `PORT` in server `.env` and update API URL in client config.

### Authentication Failed

Ensure password hash is correct. Re-run hash script if needed.

### Notes Not Saving

Check `NOTES_PATH` directory exists and has write permissions.

### Git Operations Failing

Ensure Git is installed and repository is initialized in `NOTES_PATH`.

