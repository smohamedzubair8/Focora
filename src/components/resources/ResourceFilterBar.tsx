import React from 'react';
import { Search, LayoutGrid, Table, X } from 'lucide-react';
import { LearningGoal, ViewMode } from '../../types/database.types';

interface ResourceFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeGoalFilter: string; // 'all' | 'unassigned' | goalId
  onGoalFilterChange: (filter: string) => void;
  goals: LearningGoal[];
  totalCount: number;
  unassignedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  goalCounts: Record<string, number>;
}

export const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  activeGoalFilter,
  onGoalFilterChange,
  goals,
  totalCount,
  unassignedCount,
  viewMode,
  onViewModeChange,
  goalCounts,
}) => {
  return (
    <div className="space-y-4">
      {/* Filter pills row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onGoalFilterChange('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
            activeGoalFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          All Resources ({totalCount})
        </button>

        {goals.map((g) => {
          const count = goalCounts[g.id] || 0;
          const isActive = activeGoalFilter === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onGoalFilterChange(g.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{g.skill_name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => onGoalFilterChange('unassigned')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
            activeGoalFilter === 'unassigned'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Unassigned</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeGoalFilter === 'unassigned' ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
            {unassignedCount}
          </span>
        </button>
      </div>

      {/* Search & view mode toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs bg-white text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {totalCount} total items loaded
          </span>

          <div className="flex items-center bg-white p-1 rounded-full border border-slate-200/80 shadow-sm">
            <button
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-full transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
