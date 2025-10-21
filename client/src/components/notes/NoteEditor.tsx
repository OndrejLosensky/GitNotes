import { useState } from 'react';

interface NoteEditorProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export default function NoteEditor({ content, onSave, onCancel, saving = false }: NoteEditorProps) {
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    onSave(editContent);
  };

  return (
    <div className="flex flex-col h-full">
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="flex-1 w-full px-4 py-3 border-0 focus:ring-0 font-mono text-sm resize-none"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        placeholder="Start typing..."
      />
      <div 
        className="border-t px-4 py-3 flex gap-2"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm"
          style={{
            backgroundColor: saving ? 'var(--text-tertiary)' : 'var(--color-success)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = 'var(--color-success)';
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = 'var(--color-success)';
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-sm"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

