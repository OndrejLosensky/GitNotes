import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { removeToken } from '../../utils/auth';

interface Note {
  name: string;
  path: string;
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';
}

interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  gitStatus?: 'unmodified' | 'modified' | 'untracked' | 'staged';
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesTree, setNotesTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [stagingAll, setStagingAll] = useState(false);
  const [showCommit, setShowCommit] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showTree, setShowTree] = useState(false);
  const [treeLoading, setTreeLoading] = useState(false);
  const [tree, setTree] = useState<any[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      // Fetch both flat notes and tree structure
      const [notesResponse, treeResponse] = await Promise.all([
        apiClient.get('/notes'),
        apiClient.get('/notes/tree')
      ]);
      setNotes(notesResponse.data.notes || []);
      setNotesTree(treeResponse.data.tree || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    setPulling(true);
    setPullMessage('');
    try {
      const response = await apiClient.post('/git/pull');
      setPullMessage(response.data.message);
      // Refresh notes after pull
      await fetchNotes();
    } catch (error: any) {
      setPullMessage(error.response?.data?.message || 'Failed to pull');
    } finally {
      setPulling(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const handleCreateNote = async () => {
    if (!newNoteName.trim() || !newNoteContent.trim()) return;

    try {
      await apiClient.post('/notes', {
        name: newNoteName,
        path: '',
        content: newNoteContent,
      });
      setNewNoteName('');
      setNewNoteContent('');
      setShowCreate(false);
      await fetchNotes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleGitStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await apiClient.get('/git/status');
      const status = response.data;
      const statusText = `
Git Status:
Branch: ${status.branch}
Ahead: ${status.ahead} | Behind: ${status.behind}

Modified (${status.modified.length}):
${status.modified.map((f: any) => `  - ${f.path}`).join('\n') || '  (none)'}

Staged (${status.staged.length}):
${status.staged.map((f: any) => `  - ${f.path}`).join('\n') || '  (none)'}

Untracked (${status.untracked.length}):
${status.untracked.map((f: any) => `  - ${f.path}`).join('\n') || '  (none)'}

Deleted (${status.deleted.length}):
${status.deleted.map((f: any) => `  - ${f.path}`).join('\n') || '  (none)'}
      `.trim();
      alert(statusText);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to get git status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStageAll = async () => {
    setStagingAll(true);
    try {
      await apiClient.post('/git/stage', { all: true });
      alert('All changes staged successfully');
      await fetchNotes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to stage all changes');
    } finally {
      setStagingAll(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim() || commitMessage.trim().length < 3) {
      alert('Commit message must be at least 3 characters long');
      return;
    }

    setCommitting(true);
    try {
      const response = await apiClient.post('/git/commit', {
        message: commitMessage,
      });
      alert(`Commit successful! Hash: ${response.data.hash.substring(0, 7)}`);
      setCommitMessage('');
      setShowCommit(false);
      await fetchNotes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to commit changes');
    } finally {
      setCommitting(false);
    }
  };

  const handlePush = async () => {
    setPushing(true);
    try {
      const response = await apiClient.post('/git/push');
      alert(`Push successful! ${response.data.message}`);
      await fetchNotes();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to push to GitHub';
      if (error.response?.status === 409) {
        // Conflict - suggest pulling first
        alert(`${errorMessage}\n\nTry pulling the latest changes first.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setPushing(false);
    }
  };

  const handleViewHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await apiClient.get('/git/history?limit=20');
      setHistory(response.data.commits || []);
      setShowHistory(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch git history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const handleViewTree = async () => {
    setTreeLoading(true);
    try {
      const response = await apiClient.get('/notes/tree');
      setTree(response.data.tree || []);
      setShowTree(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch folder tree');
    } finally {
      setTreeLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('Folder name is required');
      return;
    }

    setCreatingFolder(true);
    try {
      const response = await apiClient.post('/notes/folders', {
        name: newFolderName,
        parentPath: '', // Create in root for now
      });
      alert(`Folder created successfully! ${response.data.message}`);
      setNewFolderName('');
      setShowCreateFolder(false);
      await fetchNotes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const renderTreeNode = (node: any, level = 0) => {
    const indent = '  '.repeat(level);
    const icon = node.type === 'folder' ? '📁' : '📄';
    const statusBadge = node.gitStatus && node.gitStatus !== 'unmodified' ? (
      <span className={`ml-2 px-1 py-0.5 text-xs rounded ${
        node.gitStatus === 'staged' ? 'bg-blue-100 text-blue-800' :
        node.gitStatus === 'modified' ? 'bg-yellow-100 text-yellow-800' :
        node.gitStatus === 'untracked' ? 'bg-gray-100 text-gray-800' :
        'bg-green-100 text-green-800'
      }`}>
        {node.gitStatus}
      </span>
    ) : null;

    return (
      <div key={node.path} className="text-sm">
        <div className="flex items-center">
          <span className="font-mono text-gray-500">{indent}</span>
          <span>{icon}</span>
          <span className="ml-1">{node.name}</span>
          {statusBadge}
        </div>
        {node.children && node.children.map((child: any) => renderTreeNode(child, level + 1))}
      </div>
    );
  };

  const renderNotesTree = (node: TreeNode, level = 0) => {
    const isFile = node.type === 'file';
    const indentPx = level * 20; // 20px per level
    
    return (
      <div key={node.path}>
        <li
          onClick={() => isFile && navigate(`/note/${node.path}`)}
          className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
            isFile ? 'cursor-pointer' : 'cursor-default'
          }`}
          style={{ paddingLeft: `${24 + indentPx}px` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="mr-2">
                  {node.type === 'folder' ? '📁' : '📄'}
                </span>
                <p className="text-sm font-medium text-gray-900">
                  {node.name}
                </p>
                {node.gitStatus && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    node.gitStatus === 'staged' ? 'bg-blue-100 text-blue-800' :
                    node.gitStatus === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                    node.gitStatus === 'untracked' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {node.gitStatus}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{node.path}</p>
            </div>
            {isFile && (
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </div>
        </li>
        {node.children && (
          <ul className="divide-y divide-gray-200">
            {node.children.map((child) => renderNotesTree(child, level + 1))}
          </ul>
        )}
      </div>
    );
  };

  const countFilesInTree = (nodes: TreeNode[]): number => {
    let count = 0;
    for (const node of nodes) {
      if (node.type === 'file') {
        count++;
      }
      if (node.children) {
        count += countFilesInTree(node.children);
      }
    }
    return count;
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'unmodified') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Unmodified
        </span>
      );
    }
    if (status === 'modified') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Modified
        </span>
      );
    }
    if (status === 'untracked') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          Untracked
        </span>
      );
    }
    if (status === 'staged') {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          Staged
        </span>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 flex gap-4 items-center flex-wrap">
          <button
            onClick={handlePull}
            disabled={pulling}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {pulling ? 'Pulling...' : 'Pull Latest'}
          </button>
          <button
            onClick={handleGitStatus}
            disabled={statusLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {statusLoading ? 'Loading...' : 'Git Status'}
          </button>
          <button
            onClick={handleStageAll}
            disabled={stagingAll}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400"
          >
            {stagingAll ? 'Staging...' : 'Stage All'}
          </button>
          <button
            onClick={() => setShowCommit(!showCommit)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {showCommit ? 'Cancel' : 'Commit'}
          </button>
          <button
            onClick={handlePush}
            disabled={pushing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
          >
            {pushing ? 'Pushing...' : 'Push to GitHub'}
          </button>
          <button
            onClick={handleViewHistory}
            disabled={historyLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400"
          >
            {historyLoading ? 'Loading...' : 'View History'}
          </button>
          <button
            onClick={handleViewTree}
            disabled={treeLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {treeLoading ? 'Loading...' : 'View Tree'}
          </button>
          <button
            onClick={() => setShowCreateFolder(!showCreateFolder)}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            {showCreateFolder ? 'Cancel' : '+ New Folder'}
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            {showCreate ? 'Cancel' : '+ New Note'}
          </button>
          {pullMessage && (
            <span className="text-sm text-gray-600">{pullMessage}</span>
          )}
        </div>

        {showCommit && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Commit Changes</h3>
            <textarea
              placeholder="Enter commit message (min 3 characters)..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-3"
              rows={3}
            />
            <button
              onClick={handleCommit}
              disabled={committing}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-400"
            >
              {committing ? 'Committing...' : 'Commit Staged Changes'}
            </button>
          </div>
        )}

        {showCreate && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Create New Note</h3>
            <input
              type="text"
              placeholder="Note name (e.g., my-note.md)"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-3"
            />
            <textarea
              placeholder="Note content..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-3"
              rows={6}
            />
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        )}

        {showCreateFolder && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-3"
            />
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-400"
            >
              {creatingFolder ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        )}

        {showTree && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Folder Tree</h3>
              <button
                onClick={() => setShowTree(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto font-mono text-sm">
              {tree.length === 0 ? (
                <p className="text-gray-500">No files or folders found</p>
              ) : (
                <div className="space-y-1">
                  {tree.map((node) => renderTreeNode(node))}
                </div>
              )}
            </div>
          </div>
        )}

        {showHistory && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Git History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500">No commits found</p>
              ) : (
                <div className="space-y-3">
                  {history.map((commit) => (
                    <div key={commit.hash} className="border-b border-gray-200 pb-3 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {commit.hash.substring(0, 7)}
                            </code>
                            <span className="text-sm text-gray-600">
                              {commit.author}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {commit.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(commit.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-600">Loading notes...</div>
        ) : notesTree.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-lg">No notes found</p>
            <p className="text-sm mt-2">
              Add some .md files to your repository and pull to see them here
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notesTree.map((node) => renderNotesTree(node))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Total notes: {countFilesInTree(notesTree)}
        </div>
      </div>
    </div>
  );
}

