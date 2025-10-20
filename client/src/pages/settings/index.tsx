import { useState } from 'react';

export default function SettingsPage() {
  const [repoUrl, setRepoUrl] = useState('');

  const handleSave = () => {
    // TODO: Implement repo configuration save
    console.log('Saving repo URL:', repoUrl);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Repository Configuration */}
        <div>
          <div className="mb-3">
            <h2 className="text-sm font-medium text-gray-900">Repository</h2>
            <p className="text-xs text-gray-500 mt-1">
              Configure the Git repository for your notes
            </p>
          </div>
          
          <div className="space-y-3">
            <div>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository.git"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRepoUrl('')}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
