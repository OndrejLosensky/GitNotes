import { type CommitDetails } from '../../types';
import FileDiff from './FileDiff';

interface CommitDetailProps {
  commitDetails: CommitDetails | null;
  loading: boolean;
  error: string | null;
}

export default function CommitDetail({ commitDetails, loading, error }: CommitDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading commit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-error)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-error)' }}>Error loading commit</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!commitDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-tertiary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p style={{ color: 'var(--text-tertiary)' }}>Select a commit to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Commit Header */}
      <div 
        className="border-b p-6 sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="mb-3">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {commitDetails.message}
          </h2>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {commitDetails.author}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(commitDetails.date)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <code 
            className="px-3 py-1 rounded font-mono"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
            }}
          >
            {commitDetails.hash.substring(0, 8)}
          </code>
          <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{commitDetails.filesChanged}</span> file{commitDetails.filesChanged !== 1 ? 's' : ''}
            </span>
            <span className="font-medium" style={{ color: 'var(--git-added)' }}>
              +{commitDetails.additions}
            </span>
            <span className="font-medium" style={{ color: 'var(--git-deleted)' }}>
              -{commitDetails.deletions}
            </span>
          </div>
        </div>
      </div>

      {/* File Changes */}
      <div className="p-6">
        {commitDetails.files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No file changes in this commit</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>
              Changed Files
            </h3>
            {commitDetails.files.map((file, index) => (
              <FileDiff key={index} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

