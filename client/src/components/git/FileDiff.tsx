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
    <div 
      className="border rounded-lg overflow-hidden mb-4"
      style={{ borderColor: 'var(--border-color)' }}
    >
      {/* File Header */}
      <div 
        className="px-4 py-2 border-b flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{getFileIcon(file.path)}</span>
          <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{file.path}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium" style={{ color: 'var(--git-added)' }}>+{file.additions}</span>
            <span className="font-medium" style={{ color: 'var(--git-deleted)' }}>-{file.deletions}</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
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
        <div className="overflow-x-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {file.chunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="font-mono text-xs">
              {/* Chunk Header */}
              <div 
                className="px-4 py-1 border-y"
                style={{
                  backgroundColor: 'var(--sidebar-active)',
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                }}
              >
                @@ -{chunk.oldStart},{chunk.oldLines} +{chunk.newStart},{chunk.newLines} @@
              </div>
              
              {/* Diff Lines */}
              {chunk.lines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className="flex"
                  style={{
                    backgroundColor: line.type === 'add' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : line.type === 'remove' 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'var(--bg-primary)'
                  }}
                >
                  {/* Line Numbers */}
                  <div className="flex-shrink-0 select-none">
                    <span 
                      className="inline-block w-12 px-2 text-right"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        backgroundColor: line.type === 'remove' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                      }}
                    >
                      {line.oldLineNumber || ''}
                    </span>
                    <span 
                      className="inline-block w-12 px-2 text-right"
                      style={{ 
                        color: 'var(--text-tertiary)',
                        backgroundColor: line.type === 'add' ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                      }}
                    >
                      {line.newLineNumber || ''}
                    </span>
                  </div>
                  
                  {/* Line Content */}
                  <div className="flex-1 px-2 py-0.5 overflow-x-auto">
                    <span style={{
                      color: line.type === 'add' 
                        ? 'var(--git-added)' 
                        : line.type === 'remove' 
                        ? 'var(--git-deleted)' 
                        : 'var(--text-primary)'
                    }}>
                      {line.type === 'add' && <span className="font-bold" style={{ color: 'var(--git-added)' }}>+</span>}
                      {line.type === 'remove' && <span className="font-bold" style={{ color: 'var(--git-deleted)' }}>-</span>}
                      {line.type === 'context' && <span style={{ color: 'var(--text-tertiary)' }}> </span>}
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

