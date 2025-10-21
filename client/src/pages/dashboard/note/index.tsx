import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../../api/client';

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
  const [staging, setStaging] = useState(false);

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

  const handleStage = async () => {
    if (!notePath) return;
    setStaging(true);
    try {
      await apiClient.post('/git/stage', { files: [notePath] });
      alert('File staged successfully');
      // Refresh note to update git status
      const response = await apiClient.get(`/notes/content/${notePath}`);
      setNote(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to stage file');
    } finally {
      setStaging(false);
    }
  };

  const handleUnstage = async () => {
    if (!notePath) return;
    setStaging(true);
    try {
      await apiClient.post('/git/unstage', { files: [notePath] });
      alert('File unstaged successfully');
      // Refresh note to update git status
      const response = await apiClient.get(`/notes/content/${notePath}`);
      setNote(response.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unstage file');
    } finally {
      setStaging(false);
    }
  };

  const showStageButton = note?.gitStatus === 'modified' || note?.gitStatus === 'untracked';
  const showUnstageButton = note?.gitStatus === 'staged';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--color-error)' }}>{error || 'Note not found'}</p>
          <button
            onClick={() => navigate('/notes')}
            className="px-4 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div 
        className="border-b px-6 py-4"
        style={{ 
          borderColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{note.name}</h1>
            <div className="flex items-center gap-4 text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
              <span>{note.path}</span>
              {note.size && <span>{formatSize(note.size)}</span>}
              {note.modifiedDate && (
                <span>Modified: {formatDate(note.modifiedDate)}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {/* Stage/Unstage button */}
                {showStageButton && (
                  <button
                    onClick={handleStage}
                    disabled={staging}
                    className="p-2 rounded-md transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Stage changes"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                )}
                {showUnstageButton && (
                  <button
                    onClick={handleUnstage}
                    disabled={staging}
                    className="p-2 rounded-md transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-tertiary)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Unstage changes"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Edit button */}
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-md transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Edit note"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Delete button */}
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-md transition-colors"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-error)';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  title="Delete note"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                {/* Cancel button */}
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Cancel
                </button>

                {/* Save button - Primary action */}
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-white text-sm rounded-md transition-colors flex items-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-full px-4 py-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Start writing your note..."
              />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-none">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {note.content || 'No content yet. Click Edit to start writing.'}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

