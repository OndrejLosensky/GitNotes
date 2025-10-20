export default function HistoryPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">History</h1>
        <p className="text-gray-500">Commit history and project timeline coming soon...</p>
      </div>
    </div>
  );
}
