import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  itemType: 'goal' | 'resource';
  isPrimary?: boolean;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  isPrimary = false,
  isDeleting = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Trash2 className="w-5 h-5 text-rose-600" />}
      maxWidth="max-w-[460px]"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{itemName}"</span>?
        </p>

        {itemType === 'goal' ? (
          <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Safe Resource Preservation</span>
            </div>
            <p>
              Deleting this goal will <strong>not delete</strong> its associated resources. They will simply become <strong>unassigned</strong> in your resource library.
            </p>
            {isPrimary && (
              <p className="text-rose-700 font-medium pt-1">
                ⚠️ This is currently your <strong>Primary Focus</strong>. Deleting it will clear the primary selection. You can assign a new primary goal anytime.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 text-xs text-slate-600">
            This will permanently remove this resource link from your library.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
