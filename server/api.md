# API Reference

All endpoints except `/auth/login` require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication

### `POST /auth/login`
Login with password and receive JWT token.

---

## Notes

### `GET /notes`
Get list of all notes.

### `GET /notes/content/*`
Get content of specific note by path.

### `POST /notes`
Create new note.

### `PUT /notes/*`
Update existing note by path.

### `DELETE /notes/*`
Delete note or folder by path.

### `GET /notes/tree`
Get folder tree structure.

### `POST /notes/folders`
Create new folder.

### `GET /notes/search?q=<query>&folder=<folder>`
Search notes by query string.

---

## Git Operations

### `GET /git/status`
Get current Git repository status.

### `POST /git/pull`
Pull latest changes from remote.

### `POST /git/push`
Push local commits to remote.

### `POST /git/stage`
Stage files for commit.

### `POST /git/unstage`
Unstage files.

### `POST /git/commit`
Create new commit with message.

### `GET /git/history?limit=<number>`
Get commit history (default limit: 10, max: 50).

### `GET /git/commits/:hash`
Get detailed information about specific commit.

---

## Branches

### `GET /git/branches`
List all branches.

### `GET /git/branches/current`
Get current branch name.

### `POST /git/branches`
Create new branch.

### `POST /git/checkout`
Switch to different branch.

### `DELETE /git/branches/:name?force=<boolean>`
Delete branch (optionally force delete).

