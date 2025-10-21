export default function DashboardPlaceholder() {
  return (
    <div 
      className="flex items-center justify-center h-full"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="text-center max-w-md px-6">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 
          className="text-2xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Welcome to GitNotes
        </h2>
        <p 
          className="mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          Select a note from the sidebar to get started, or create a new one to begin taking notes.
        </p>
        <div 
          className="space-y-2 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <p>💡 Use the sidebar to browse your notes</p>
          <p>🔄 Track changes with Git integration</p>
          <p>✏️ Create and edit markdown files</p>
        </div>
      </div>
    </div>
  );
}

