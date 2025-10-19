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
        placeholder="Start typing..."
      />
      <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 text-sm"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

