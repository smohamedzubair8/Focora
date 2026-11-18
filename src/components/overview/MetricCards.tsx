import React from 'react';
import { Target, Layers, Bookmark, CheckCircle2 } from 'lucide-react';
import { LearningGoal } from '../../types/database.types';

interface MetricCardsProps {
  primaryGoal: LearningGoal | null;
  queuedCount: number;
  totalResources: number;
  assignedResources: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  primaryGoal,
  queuedCount,
  totalResources,
  assignedResources,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Metric 1: Primary Focus */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all group">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Primary Focus</span>
          <Target className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
            {primaryGoal ? primaryGoal.skill_name : 'None'}
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
              primaryGoal
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {primaryGoal ? 'Active #1' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Metric 2: Goals Queued */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all group">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Goals Queued</span>
          <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{queuedCount}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 bg-blue-50 text-blue-700 border border-blue-200">
            Sequential
          </span>
        </div>
      </div>

      {/* Metric 3: Total Ingests */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all group">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Total Ingests</span>
          <Bookmark className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">{totalResources}</div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 bg-amber-50 text-amber-700 border border-amber-200">
            Saved Links
          </span>
        </div>
      </div>

      {/* Metric 4: Assigned / Curated */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:border-blue-200 transition-all group">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Assigned to Goals</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {assignedResources} <span className="text-xs font-normal text-slate-400">/ {totalResources}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 bg-emerald-50 text-emerald-700 border border-emerald-200">
            {totalResources > 0 ? `${Math.round((assignedResources / totalResources) * 100)}%` : '0%'}
          </span>
        </div>
      </div>
    </div>
  );
};
