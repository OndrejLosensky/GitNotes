import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

interface NoteContent {
  name: string;
  path: string;
  size?: number;
  modifiedDate?: string;
  gitStatus?: string;
  content: string;
}

export default function NotePage() {
  const { '*': notePath } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<NoteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      if (!notePath) return;

      setLoading(true);
      setError('');

      try {
        const response = await apiClient.get(`/notes/content/${notePath}`);
        setNote(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [notePath]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEdit = () => {
    setEditContent(note?.content || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!notePath) return;

    try {
      await apiClient.put(`/notes/${notePath}`, { content: editContent });
      setNote({ ...note!, content: editContent });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDelete = async () => {
    if (!notePath) return;
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await apiClient.delete(`/notes/${notePath}`);
      navigate('/notes');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Note not found'}</p>
          <button
            onClick={() => navigate('/notes')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/notes')}
            className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
          >
            ← Back to Notes
          </button>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-900">{note.name}</h1>
            <div className="mt-2 flex gap-4 text-sm text-gray-500">
              <span>{note.path}</span>
              {note.size && <span>{formatSize(note.size)}</span>}
              {note.modifiedDate && (
                <span>Modified: {formatDate(note.modifiedDate)}</span>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  rows={20}
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                {note.content}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

