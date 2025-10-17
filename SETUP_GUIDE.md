# GitNotes Setup Guide

Complete step-by-step guide to get GitNotes running.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- pnpm package manager installed (`npm install -g pnpm`)
- A GitHub account
- A GitHub repository with some `.md` files for testing

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name like "GitNotes Access"
4. Select scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** - you won't see it again!

## Step 2: Create a Notes Repository

1. Create a new GitHub repository (e.g., `my-notes`)
2. Add at least one `.md` file to test with, for example:
   ```markdown
   # My First Note
   This is a test note.
   ```
3. Note the repository URL (e.g., `https://github.com/yourusername/my-notes.git`)

## Step 3: Configure Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Generate a hashed password:
   ```bash
   pnpm ts-node scripts/hash-password.ts mypassword123
   ```
   Copy the output hash.

3. Edit the `.env` file:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_REPO_URL=https://github.com/yourusername/my-notes.git
   AUTH_PASSWORD=$2b$10$your_hashed_password_here
   JWT_SECRET=some_random_string_keep_it_secret
   NOTES_PATH=./data/notes
   PORT=3001
   ```

4. Replace:
   - `GITHUB_TOKEN` with your GitHub token
   - `GITHUB_REPO_URL` with your repository URL
   - `AUTH_PASSWORD` with the hash from step 2
   - `JWT_SECRET` with a random string (you can use: `openssl rand -base64 32`)

## Step 4: Start the Backend

```bash
cd server
pnpm start:dev
```

You should see:
```
Application is running on: http://localhost:3001
Repository cloned successfully (or already cloned)
```

## Step 5: Start the Frontend

In a new terminal:
```bash
cd client
pnpm dev
```

You should see:
```
  VITE v... ready in ... ms
  ➜  Local:   http://localhost:5173/
```

## Step 6: Test the Application

1. Open your browser to `http://localhost:5173`
2. You should see the login page
3. Enter the password
4. Click "Sign in"
5. You should see your notes listed!

## Step 7: Test Git Pull Functionality

1. In GitHub, add a new `.md` file to your repository:
   - Go to your repository
   - Click "Add file" → "Create new file"
   - Name it `test-note.md`
   - Add some content
   - Commit the file

2. Back in the GitNotes app, click the "Pull Latest" button
3. You should see the new file appear in the list!

## Troubleshooting

### Backend won't start
- Check that all dependencies are installed: `pnpm install`
- Verify `.env` file exists and has all required variables
- Check if port 3001 is already in use

### Clone fails
- Verify your GitHub token has the correct permissions
- Check that the repository URL is correct
- For private repos, ensure the token has `repo` scope

### Authentication fails
- Verify the password hash was generated correctly
- Make sure you're using the **unhashed** password to login
- Check browser console for errors

### Notes don't appear
- Check that your repository contains `.md` files
- Verify the backend cloned the repo successfully (check `server/data/notes`)
- Check browser console and backend logs for errors

### Pull doesn't work
- Ensure GitHub token is valid
- Check backend logs for git errors
- Verify you have network connectivity

## Production Deployment Notes

For production deployment, you'll want to:

1. Use a proper secret management system for tokens
2. Set up HTTPS
3. Use environment-specific `.env` files
4. Build the frontend: `cd client && pnpm build`
5. Build the backend: `cd server && pnpm build`
6. Use a process manager like PM2 for the backend
7. Serve the frontend through Nginx or similar
8. Consider using Docker for containerization

## Next Steps

Now that you have the MVP running, you can:

1. Add more notes to your GitHub repository
2. Test the pull functionality
3. Plan out additional features for your SaaS
4. Consider adding:
   - Note content viewing
   - Markdown rendering
   - Note editing
   - Search functionality
   - Multi-user support

Enjoy your Git-controlled notes! 🎉

