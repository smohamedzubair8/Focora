import React, { useState, useEffect, useRef } from 'react';
import { Link2, AlertCircle, CheckCircle2, BookmarkPlus, ExternalLink, FileText, Folder, Upload } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LearningGoal, LearningResource } from '../../types/database.types';
import { isValidUrl, resourcesService } from '../../services/resourcesService';
import { useAuth } from '../../context/AuthContext';

interface AddEditResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, url: string, goalId: string | null, fileObj?: File | null) => Promise<void>;
  resourceToEdit?: LearningResource | null;
  goals: LearningGoal[];
  defaultGoalId?: string | null;
}

export const AddEditResourceModal: React.FC<AddEditResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  resourceToEdit,
  goals,
  defaultGoalId,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resourceType, setResourceType] = useState<'link' | 'file' | 'folder'>('link');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [displayPath, setDisplayPath] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (resourceToEdit) {
        setTitle(resourceToEdit.title);
        setUrl(resourceToEdit.url);
        setDisplayPath(
          resourceToEdit.url.startsWith('data:')
            ? `${resourceToEdit.title}.pdf`
            : resourceToEdit.url
        );
        setGoalId(resourceToEdit.goal_id || '');
        if (resourceToEdit.url.startsWith('~/') || resourceToEdit.url.includes('/workspace/')) {
          setResourceType('folder');
        } else if (
          resourceToEdit.url.startsWith('data:') ||
          /\.(pdf|md|epub|zip|doc|docx|png|jpg|txt)$/i.test(resourceToEdit.url) ||
          resourceToEdit.url.startsWith('file://')
        ) {
          setResourceType('file');
        } else {
          setResourceType('link');
        }
      } else {
        setTitle('');
        setUrl('');
        setDisplayPath('');
        setGoalId(defaultGoalId || '');
        setResourceType('link');
      }
      setError(null);
      setUrlWarning(null);
      setIsSubmitting(false);
    }
  }, [isOpen, resourceToEdit, defaultGoalId]);

  // Live URL validation and duplicate check
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed || !user) {
      setUrlWarning(null);
      return;
    }

    if (!isValidUrl(trimmed)) {
      setUrlWarning(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const isDuplicate = await resourcesService.checkDuplicateUrl(
          user.id,
          trimmed,
          resourceToEdit?.id
        );
        if (isDuplicate) {
          setUrlWarning('Notice: This exact destination has already been saved in your library.');
        } else {
          setUrlWarning(null);
        }
      } catch (err) {
        console.error('Duplicate URL check failed', err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [url, user, resourceToEdit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileObj(file);
      if (!title) {
        // Set clean title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      setDisplayPath(file.name);
      setUrl(file.name);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    if (!trimmedTitle) {
      setError('Resource title is required.');
      return;
    }

    if (!trimmedUrl) {
      setError(
        resourceType === 'link'
          ? 'Resource URL is required.'
          : resourceType === 'file'
          ? 'Please choose a file or enter a file path.'
          : 'Folder path is required.'
      );
      return;
    }

    if (resourceType === 'link' && !isValidUrl(trimmedUrl)) {
      setError('Please provide a valid web URL starting with http:// or https://');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(trimmedTitle, trimmedUrl, goalId ? goalId : null, selectedFileObj);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save resource. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentUrlValid = isValidUrl(url.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resourceToEdit ? 'Edit Resource' : 'Add New Resource'}
      subtitle="Save study materials, documentation, and curated directories into your deliberate sequencing vault."
      icon={<BookmarkPlus className="w-5 h-5 text-blue-600" />}
      maxWidth="max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hidden file input for Browse button */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.md,.epub,.zip,.doc,.docx,.txt,.png,.jpg,.jpeg"
        />

        {/* Resource Type selector with Link, File, and Folder tabs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Resource Type <span className="text-rose-500">*</span></span>
            <span className="text-slate-400 text-[11px]">Select intake format</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setResourceType('link');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                resourceType === 'link'
                  ? 'bg-blue-50 border-2 border-blue-600 text-blue-700'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              Link
            </button>
            <button
              type="button"
              onClick={() => {
                setResourceType('file');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                resourceType === 'file'
                  ? 'bg-blue-50 border-2 border-blue-600 text-blue-700'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              File
            </button>
            <button
              type="button"
              onClick={() => {
                setResourceType('folder');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                resourceType === 'folder'
                  ? 'bg-blue-50 border-2 border-blue-600 text-blue-700'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-blue-500" />
              Folder
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="resource_title" className="block text-xs font-bold text-slate-800">
              Resource Name / Title <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">Primary index label</span>
          </div>
          <input
            id="resource_title"
            type="text"
            required
            placeholder={
              resourceType === 'link'
                ? 'e.g. Responsive Web Design Masterclass'
                : resourceType === 'file'
                ? 'e.g. Design Systems Guide PDF'
                : 'e.g. Frontend Architecture Starter Kit'
            }
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          />
        </div>

        {/* Location / Destination Input with Browse Button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="resource_url" className="block text-xs font-bold text-slate-800">
              {resourceType === 'link'
                ? 'Location / Destination'
                : resourceType === 'file'
                ? 'File Attachment / Path'
                : 'Workspace Folder Path'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            {isCurrentUrlValid ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid destination
              </span>
            ) : url.trim() ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                Invalid format
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              {resourceType === 'link' ? (
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : resourceType === 'file' ? (
                <FileText className="w-4 h-4 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              <input
                id="resource_url"
                type="text"
                required
                placeholder={
                  resourceType === 'link'
                    ? 'https://web.dev/learn/design'
                    : resourceType === 'file'
                    ? 'e.g. Select a PDF file or enter file path...'
                    : '~/workspace/starter-kits/next-tailwind'
                }
                value={resourceType === 'file' ? displayPath || url : url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setDisplayPath(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
              {resourceType === 'link' && isCurrentUrlValid && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview link in new tab"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Browse Button for File intake */}
            {resourceType === 'file' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Browse...
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Supports URLs, PDFs, Markdown (.md), ePUB, ZIP, and Local Workspace Folders
          </p>

          {/* Duplicate Warning */}
          {urlWarning && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{urlWarning}</span>
            </div>
          )}
        </div>

        {/* Associated Goal Dropdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="associated_goal" className="block text-xs font-bold text-slate-800">
              Associated Learning Goal
            </label>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>

          <select
            id="associated_goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-slate-50/70 focus:bg-white text-slate-900 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
          >
            <option value="">-- No associated goal (Unassigned) --</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.skill_name} {g.is_primary ? '★ (Primary Focus)' : ''}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500">
            Unassigned resources can be sequenced into a learning goal at any later time.
          </p>
        </div>

        {/* Submission Error Banner */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : resourceToEdit ? (
              'Save Changes'
            ) : (
              'Add to Library'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
