import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type TreeNode } from '../../types';
import StatusDot from '../common/StatusDot.tsx';

interface NoteItemProps {
  node: TreeNode;
  level: number;
}

export default function NoteItem({ node, level }: NoteItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;
  const isActive = location.pathname === `/note/${node.path}`;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(`/note/${node.path}`);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'md':
        return (
          <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const paddingLeft = 8 + level * 20;

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer group transition-all duration-150 ${
          isActive 
            ? 'bg-indigo-50 border-r-2 border-indigo-500 text-indigo-700' 
            : 'hover:bg-gray-50 text-gray-700'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {/* Chevron for folders */}
        {isFolder && hasChildren && (
          <div className="flex-shrink-0 w-4 flex justify-center">
            <svg 
              className={`w-3 h-3 transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              } text-gray-400`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        )}
        
        {/* Spacer for files */}
        {!isFolder && (
          <div className="flex-shrink-0 w-4"></div>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          {isFolder ? (
            <svg 
              className={`w-4 h-4 transition-colors duration-150 ${
                isExpanded ? 'text-blue-600' : 'text-gray-500'
              }`}
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
            getFileIcon(node.name)
          )}
        </div>

        {/* File/Folder name */}
        <span className={`flex-1 text-sm truncate transition-colors duration-150 ${
          isActive ? 'font-medium' : 'font-normal'
        }`}>
          {node.name}
        </span>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          <StatusDot status={node.gitStatus} size="sm" />
        </div>
      </div>
      
      {/* Children */}
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

