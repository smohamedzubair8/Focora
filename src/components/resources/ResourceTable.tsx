import React from 'react';
import { ExternalLink, Edit2, Trash2, Link as LinkIcon, BookOpen, Video, FileText, Folder } from 'lucide-react';
import { LearningResource } from '../../types/database.types';

interface ResourceTableProps {
  resources: LearningResource[];
  onEdit: (resource: LearningResource) => void;
  onDelete: (resource: LearningResource) => void;
  onAssignGoal: (resource: LearningResource) => void;
  onOpenFile: (resource: LearningResource) => void;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  resources,
  onEdit,
  onDelete,
  onAssignGoal,
  onOpenFile,
}) => {
  const getResourceIcon = (url: string, title: string) => {
    const lower = (url + ' ' + title).toLowerCase();
    if (url.startsWith('~/') || url.includes('/workspace/') || lower.includes('folder') || lower.includes('starter kit')) {
      return (
        <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <Folder className="w-4 h-4" />
        </div>
      );
    }
    if (/\.(pdf|md|epub|zip|doc|docx|txt)$/i.test(url) || lower.includes('.pdf') || lower.includes('guide pdf')) {
      return (
        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (lower.includes('course') || lower.includes('learn')) {
      return (
        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
      );
    }
    if (lower.includes('video') || lower.includes('youtube')) {
      return (
        <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Video className="w-4 h-4" />
        </div>
      );
    }
    if (lower.includes('article') || lower.includes('docs') || lower.includes('guide')) {
      return (
        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <LinkIcon className="w-4 h-4" />
      </div>
    );
  };

  const getResourceType = (url: string, title: string) => {
    const lower = (url + ' ' + title).toLowerCase();
    if (url.startsWith('~/') || url.includes('/workspace/') || lower.includes('folder') || lower.includes('starter kit')) return 'Folder';
    if (/\.(pdf|md|epub|zip|doc|docx|txt)$/i.test(url) || lower.includes('.pdf') || lower.includes('guide pdf')) return 'File';
    if (lower.includes('course') || lower.includes('class') || lower.includes('learn')) return 'Course';
    if (lower.includes('video') || lower.includes('youtube')) return 'Video';
    if (lower.includes('article') || lower.includes('blog')) return 'Article';
    return 'Link';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <th className="py-3.5 px-4 font-bold">Resource Details</th>
            <th className="py-3.5 px-4 font-bold">Type</th>
            <th className="py-3.5 px-4 font-bold">Associated Learning Goal</th>
            <th className="py-3.5 px-4 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {resources.map((resource) => {
            const type = getResourceType(resource.url, resource.title);

            return (
              <tr
                key={resource.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* Details */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3.5">
                    {getResourceIcon(resource.url, resource.title)}
                    <div className="space-y-0.5 max-w-md">
                      <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {resource.title}
                      </div>
                      {resource.url.startsWith('http://') || resource.url.startsWith('https://') ? (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline max-w-[340px] truncate"
                        >
                          <span className="truncate">{resource.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenFile(resource)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline max-w-[340px] truncate"
                        >
                          <span className="truncate">
                            {resource.url.startsWith('data:')
                              ? `${resource.title}.pdf`
                              : resource.url}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </button>
                      )}
                    </div>
                  </div>
                </td>

                {/* Type */}
                <td className="py-4 px-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {type}
                  </span>
                </td>

                {/* Associated Learning Goal */}
                <td className="py-4 px-4">
                  {resource.learning_goals ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {resource.learning_goals.skill_name}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Unassigned
                      </span>
                      <button
                        onClick={() => onAssignGoal(resource)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Assign Goal
                      </button>
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {resource.url.startsWith('http://') || resource.url.startsWith('https://') ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open Original Resource"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenFile(resource)}
                        title="Preview / Open Document"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
