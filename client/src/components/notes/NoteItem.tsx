import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type TreeNode } from '../../types';
import StatusDot from '../common/StatusDot.tsx';

interface NoteItemProps {
  node: TreeNode;
  level: number;
}

export default function NoteItem({ node, level }: NoteItemProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(`/note/${node.path}`);
    }
  };

  const paddingLeft = 12 + level * 16;

  return (
    <div>
      <div
        onClick={handleClick}
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer group"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {isFolder && hasChildren && (
          <svg 
            className="w-3 h-3 text-gray-400 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} 
            />
          </svg>
        )}
        {isFolder ? (
          <svg 
            className="w-4 h-4 text-gray-600 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" 
            />
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 text-gray-600 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        )}
        <span className="flex-1 text-sm text-gray-700 truncate">
          {node.name}
        </span>
        <StatusDot status={node.gitStatus} size="sm" />
      </div>
      {isFolder && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <NoteItem key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

