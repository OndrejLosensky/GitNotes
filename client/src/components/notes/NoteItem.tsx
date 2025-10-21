import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { type TreeNode } from '../../types';
import StatusDot from '../common/StatusDot.tsx';

interface NoteItemProps {
  node: TreeNode;
  level: number;
  onContextMenu?: (e: React.MouseEvent, node: TreeNode) => void;
}

export default function NoteItem({ node, level, onContextMenu }: NoteItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;
  const isActive = location.pathname === `/dashboard/note/${node.path}`;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(`/dashboard/note/${node.path}`);
    }
  };

  const getIconColorStyle = () => {
    switch (node.gitStatus) {
      case 'modified':
        return { color: 'var(--git-modified)' };
      case 'added':
        return { color: 'var(--git-added)' };
      case 'untracked':
        return { color: 'var(--text-tertiary)' };
      case 'staged':
        return { color: 'var(--text-tertiary)' };
      case 'deleted':
        return { color: 'var(--git-deleted)' };
      case 'unmodified':
      default:
        return { color: 'var(--text-tertiary)' };
    }
  };

  const getBackgroundColorStyle = () => {
    switch (node.gitStatus) {
      case 'modified':
        return { backgroundColor: 'rgba(245, 158, 11, 0.1)' };
      case 'added':
        return { backgroundColor: 'rgba(16, 185, 129, 0.1)' };
      case 'untracked':
        return { backgroundColor: 'var(--sidebar-hover)' };
      case 'staged':
        return { backgroundColor: 'var(--sidebar-hover)' };
      case 'deleted':
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)' };
      case 'unmodified':
      default:
        return {};
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconStyle = getIconColorStyle();
    
    switch (extension) {
      case 'md':
        return (
          <svg className="w-4 h-4 flex-shrink-0" style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'txt':
        return (
          <svg className="w-4 h-4 flex-shrink-0" style={iconStyle} fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 flex-shrink-0" style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const paddingLeft = 8 + level * 20;

  const baseStyle = {
    paddingLeft: `${paddingLeft}px`,
    ...(isActive 
      ? {
          backgroundColor: 'var(--sidebar-active)',
          borderRight: '2px solid var(--color-primary)',
          color: 'var(--color-primary)',
        }
      : {
          color: 'var(--text-primary)',
          ...getBackgroundColorStyle(),
        }
    ),
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={onContextMenu ? (e) => onContextMenu(e, node) : undefined}
        className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group transition-all duration-150"
        style={baseStyle}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            const bgStyle = getBackgroundColorStyle();
            e.currentTarget.style.backgroundColor = bgStyle.backgroundColor || 'transparent';
          }
        }}
      >
        {/* Chevron for folders */}
        {isFolder && (
          <div className="flex-shrink-0 w-4 flex justify-center">
            <svg 
              className={`w-3 h-3 transition-transform duration-150 ${
                isExpanded ? 'rotate-90' : ''
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-tertiary)' }}
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
              className="w-4 h-4 transition-colors duration-150"
              style={getIconColorStyle()}
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
        <span 
          className="flex-1 text-sm truncate transition-colors duration-150"
          style={{ fontWeight: isActive ? 500 : 400 }}
        >
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
            <NoteItem key={child.path} node={child} level={level + 1} onContextMenu={onContextMenu} />
          ))}
        </div>
      )}
    </div>
  );
}

