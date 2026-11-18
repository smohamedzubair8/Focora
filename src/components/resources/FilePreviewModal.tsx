import React, { useRef, useState, useEffect } from 'react';
import { Download, FileText, Upload, ExternalLink } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LearningResource } from '../../types/database.types';
import { storeLocalFile, getLocalFile } from '../../utils/fileStorage';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: LearningResource | null;
  onUpdateFileContent?: (resourceId: string, newUrl: string) => Promise<void>;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  resource,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let currentUrl: string | null = null;
    if (isOpen && resource) {
      if (resource.url.startsWith('data:') || resource.url.startsWith('blob:')) {
        setBlobUrl(resource.url);
      } else {
        // Check IndexedDB
        getLocalFile(resource.id).then((blob) => {
          if (blob) {
            currentUrl = URL.createObjectURL(blob);
            setBlobUrl(currentUrl);
          } else {
            setBlobUrl(null);
          }
        });
      }
    } else {
      setBlobUrl(null);
    }

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [isOpen, resource]);

  if (!resource) return null;

  const getDisplayFileName = () => {
    return resource.url.split(/[\\/]/).pop() || resource.title;
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } else if (resource.url.startsWith('http')) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = () => {
    if (blobUrl) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = getDisplayFileName().endsWith('.pdf')
        ? getDisplayFileName()
        : `${getDisplayFileName()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAttachFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUpdating(true);
      try {
        // Store directly into browser IndexedDB
        await storeLocalFile(resource.id, file);

        // Create instant blob URL
        const newBlobUrl = URL.createObjectURL(file);
        setBlobUrl(newBlobUrl);

        // Immediately open in a new tab!
        window.open(newBlobUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.error('Failed to attach file:', err);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resource.title}
      subtitle={resource.learning_goals ? `Goal: ${resource.learning_goals.skill_name}` : 'Unassigned Material'}
      icon={<FileText className="w-5 h-5 text-amber-500" />}
      maxWidth={blobUrl ? 'max-w-4xl' : 'max-w-xl'}
    >
      <div className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.md,.txt,.epub,.zip"
          onChange={handleAttachFile}
        />

        {/* If file is available, show reader iframe + quick open button */}
        {blobUrl ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Document Ready: {getDisplayFileName()}</span>
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="px-4 py-1.5 rounded-full font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                Open in Full Browser Tab <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-inner">
              <iframe
                src={blobUrl}
                title={resource.title}
                className="w-full h-[550px] rounded-2xl border-0 bg-white"
              />
            </div>
          </div>
        ) : (
          /* If file hasn't been attached to IndexedDB yet */
          <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-sm">
              <FileText className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-base">
                Ready to Open: <span className="text-amber-800">{getDisplayFileName()}</span>
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Click below to select your <strong>{getDisplayFileName()}</strong> from your computer. It will open in your browser immediately and remain saved for 1-click opening!
              </p>
            </div>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 inline-flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening File...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Select &amp; Open {getDisplayFileName()}
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">
            {blobUrl ? 'PDF Active in Browser' : 'Click above to select and view file'}
          </span>

          <div className="flex items-center gap-2">
            {blobUrl && (
              <>
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="px-3.5 py-2 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Full Tab
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
