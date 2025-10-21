import { useState } from 'react';
import { type FileDiff as FileDiffType } from '../../types';

interface FileDiffProps {
  file: FileDiffType;
}

export default function FileDiff({ file }: FileDiffProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getFileExtension = (path: string) => {
    const parts = path.split('.');
    return parts.length > 1 ? parts[parts.length - 1] : '';
  };

  const getFileIcon = (path: string) => {
    const ext = getFileExtension(path);
    const iconMap: Record<string, string> = {
      'ts': '📘', 'tsx': '📘', 'js': '📙', 'jsx': '📙',
      'json': '📋', 'md': '📝', 'css': '🎨', 'html': '🌐',
      'py': '🐍', 'go': '🐹', 'rs': '🦀'
    };
    return iconMap[ext] || '📄';
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
      {/* File Header */}
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{getFileIcon(file.path)}</span>
          <span className="font-mono text-sm text-gray-800 font-medium">{file.path}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600 font-medium">+{file.additions}</span>
            <span className="text-red-600 font-medium">-{file.deletions}</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg 
              className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Diff Content */}
      {!isCollapsed && (
        <div className="bg-white overflow-x-auto">
          {file.chunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="font-mono text-xs">
              {/* Chunk Header */}
              <div className="bg-blue-50 px-4 py-1 text-blue-700 border-y border-blue-200">
                @@ -{chunk.oldStart},{chunk.oldLines} +{chunk.newStart},{chunk.newLines} @@
              </div>
              
              {/* Diff Lines */}
              {chunk.lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={`flex ${
                    line.type === 'add' 
                      ? 'bg-green-50' 
                      : line.type === 'remove' 
                      ? 'bg-red-50' 
                      : 'bg-white'
                  }`}
                >
                  {/* Line Numbers */}
                  <div className="flex-shrink-0 select-none">
                    <span className={`inline-block w-12 px-2 text-right text-gray-500 ${
                      line.type === 'remove' ? 'bg-red-100' : ''
                    }`}>
                      {line.oldLineNumber || ''}
                    </span>
                    <span className={`inline-block w-12 px-2 text-right text-gray-500 ${
                      line.type === 'add' ? 'bg-green-100' : ''
                    }`}>
                      {line.newLineNumber || ''}
                    </span>
                  </div>
                  
                  {/* Line Content */}
                  <div className="flex-1 px-2 py-0.5 overflow-x-auto">
                    <span className={
                      line.type === 'add' 
                        ? 'text-green-800' 
                        : line.type === 'remove' 
                        ? 'text-red-800' 
                        : 'text-gray-700'
                    }>
                      {line.type === 'add' && <span className="text-green-600 font-bold">+</span>}
                      {line.type === 'remove' && <span className="text-red-600 font-bold">-</span>}
                      {line.type === 'context' && <span className="text-gray-400"> </span>}
                      {line.content}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

