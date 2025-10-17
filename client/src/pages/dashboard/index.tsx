import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { removeToken } from '../../utils/auth';

interface Note {
  name: string;
  path: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const navigate = useNavigate();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/notes');
      setNotes(response.data.notes || []);
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

        <div className="mb-6 flex gap-4 items-center">
          <button
            onClick={handlePull}
            disabled={pulling}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {pulling ? 'Pulling...' : 'Pull Latest'}
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

        {loading ? (
          <div className="text-center text-gray-600">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            <p className="text-lg">No notes found</p>
            <p className="text-sm mt-2">
              Add some .md files to your repository and pull to see them here
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notes.map((note, index) => (
                <li
                  key={index}
                  onClick={() => navigate(`/note/${note.path}`)}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {note.name}
                      </p>
                      <p className="text-sm text-gray-500">{note.path}</p>
                    </div>
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
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          Total notes: {notes.length}
        </div>
      </div>
    </div>
  );
}

