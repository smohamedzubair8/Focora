import React from 'react';
import { ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { LearningResource } from '../../types/database.types';

interface ResourceCardProps {
  resource: LearningResource;
  onEdit: (resource: LearningResource) => void;
  onDelete: (resource: LearningResource) => void;
  onAssignGoal: (resource: LearningResource) => void;
  onOpenFile: (resource: LearningResource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onEdit,
  onDelete,
  onAssignGoal,
  onOpenFile,
}) => {
  const getDomain = (url: string) => {
    if (url.startsWith('data:')) return 'Embedded Document';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getResourceType = (url: string, title: string) => {
    const lower = (url + ' ' + title).toLowerCase();
    if (url.startsWith('~/') || url.includes('/workspace/') || lower.includes('folder')) return 'Folder';
    if (url.startsWith('data:') || /\.(pdf|md|epub|zip|doc|docx|txt)$/i.test(url) || lower.includes('.pdf')) return 'File';
    if (lower.includes('course') || lower.includes('class') || lower.includes('learn')) return 'Course';
    if (lower.includes('video') || lower.includes('youtube')) return 'Video';
    if (lower.includes('article') || lower.includes('blog')) return 'Article';
    return 'Link';
  };

  const type = getResourceType(resource.url, resource.title);
  const domain = getDomain(resource.url);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            {type}
          </span>

          {resource.learning_goals ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 truncate max-w-[140px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">{resource.learning_goals.skill_name}</span>
            </span>
          ) : (
            <button
              onClick={() => onAssignGoal(resource)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Assign Goal
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {resource.title}
        </h3>

        {/* URL host */}
        <p className="text-xs text-slate-400 font-medium truncate">{domain}</p>
      </div>

      {/* Bottom actions */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        {resource.url.startsWith('http://') || resource.url.startsWith('https://') ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1.5"
          >
            Open Link <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => onOpenFile(resource)}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all inline-flex items-center gap-1.5"
          >
            Preview File <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(resource)}
            title="Edit Resource"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resource)}
            title="Delete Resource"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
