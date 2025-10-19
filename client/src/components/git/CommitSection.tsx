import { useState } from 'react';
import apiClient from '../../api/client';

interface CommitSectionProps {
  onClose: () => void;
}

export default function CommitSection({ onClose }: CommitSectionProps) {
  const [message, setMessage] = useState('');
  const [committing, setCommitting] = useState(false);

  const handleCommit = async () => {
    if (!message.trim() || message.trim().length < 3) {
      alert('Commit message must be at least 3 characters');
      return;
    }

    setCommitting(true);
    try {
      const response = await apiClient.post('/git/commit', { message });
      alert(`Committed: ${response.data.hash.substring(0, 7)}`);
      setMessage('');
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to commit');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="p-3 space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Commit message..."
        className="w-full px-2 py-1 text-xs border border-gray-300 rounded resize-none"
        rows={3}
      />
      <button
        onClick={handleCommit}
        disabled={committing}
        className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-green-400"
      >
        {committing ? 'Committing...' : 'Commit'}
      </button>
    </div>
  );
}

