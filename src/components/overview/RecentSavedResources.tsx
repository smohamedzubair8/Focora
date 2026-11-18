import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Bookmark, ArrowUpRight, Plus } from 'lucide-react';
import { LearningResource } from '../../types/database.types';

interface RecentSavedResourcesProps {
  resources: LearningResource[];
  onOpenAddResource: () => void;
  onOpenFile?: (resource: LearningResource) => void;
}

export const RecentSavedResources: React.FC<RecentSavedResourcesProps> = ({
  resources,
  onOpenAddResource,
  onOpenFile,
}) => {
  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getResourceType = (url: string, title: string) => {
    const lower = (url + ' ' + title).toLowerCase();
    if (url.startsWith('~/') || url.includes('/workspace/') || lower.includes('folder') || lower.includes('starter kit')) return 'Folder';
    if (/\.(pdf|md|epub|zip|doc|docx|txt)$/i.test(url) || lower.includes('.pdf') || lower.includes('guide pdf')) return 'File';
    if (lower.includes('course') || lower.includes('class') || lower.includes('learn')) return 'Course';
    if (lower.includes('video') || lower.includes('youtube') || lower.includes('watch')) return 'Video';
    if (lower.includes('article') || lower.includes('blog') || lower.includes('medium')) return 'Article';
    return 'Link';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col h-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Saved Materials</h2>
          <p className="text-xs text-slate-500 mt-0.5">Latest saved resources and documentation</p>
        </div>
        <Link
          to="/resources"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          Library <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Resources list */}
      <div className="mt-5 space-y-3.5 flex-1">
        {resources.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Bookmark className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">No resources saved yet.</p>
            <button
              onClick={onOpenAddResource}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Resource
            </button>
          </div>
        ) : (
          resources.slice(0, 5).map((resource) => {
            const domain = getDomain(resource.url);
            const type = getResourceType(resource.url, resource.title);

            return (
              <div
                key={resource.id}
                className="p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {type}
                      </span>

                      {resource.learning_goals ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 truncate max-w-[150px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">{resource.learning_goals.skill_name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Unassigned
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>

                    {/* Domain */}
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {domain}
                    </p>
                  </div>

                  {/* Open Link or File Preview Button */}
                  {resource.url.startsWith('http://') || resource.url.startsWith('https://') ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      Open <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenFile?.(resource)}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      Preview <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {resources.length > 5 && (
        <div className="pt-4 text-center border-t border-slate-100 mt-4">
          <Link
            to="/resources"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            + {resources.length - 5} more saved resources in library
          </Link>
        </div>
      )}
    </div>
  );
};
