interface NoteContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onStage?: () => void;
  onUnstage?: () => void;
}

export default function NoteContextMenu({
  x,
  y,
  onClose,
  onRename,
  onDelete,
  onStage,
  onUnstage,
}: NoteContextMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]"
      style={{ left: `${x}px`, top: `${y}px` }}
      onClick={onClose}
    >
      {onRename && (
        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
          Rename
        </button>
      )}
      {onStage && (
        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
          Stage
        </button>
      )}
      {onUnstage && (
        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
          Unstage
        </button>
      )}
      {onDelete && (
        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
          Delete
        </button>
      )}
    </div>
  );
}

