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
          <svg className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm text-gray-500">Loading commit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-600 font-medium mb-1">Error loading commit</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!commitDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Select a commit to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Commit Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-6 sticky top-0 z-10">
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {commitDetails.message}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
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
          <code className="bg-gray-200 px-3 py-1 rounded font-mono text-gray-700">
            {commitDetails.hash.substring(0, 8)}
          </code>
          <div className="flex items-center gap-3 text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{commitDetails.filesChanged}</span> file{commitDetails.filesChanged !== 1 ? 's' : ''}
            </span>
            <span className="text-green-600 font-medium">
              +{commitDetails.additions}
            </span>
            <span className="text-red-600 font-medium">
              -{commitDetails.deletions}
            </span>
          </div>
        </div>
      </div>

      {/* File Changes */}
      <div className="p-6">
        {commitDetails.files.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No file changes in this commit</p>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
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

