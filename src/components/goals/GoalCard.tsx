import React from 'react';
import { Target, Lock, Edit2, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LearningGoal } from '../../types/database.types';

interface GoalCardProps {
  goal: LearningGoal;
  index: number;
  onSetPrimary: (goalId: string) => void;
  onEdit: (goal: LearningGoal) => void;
  onDelete: (goal: LearningGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  onSetPrimary,
  onEdit,
  onDelete,
}) => {
  const indexNumber = String(index + 1).padStart(2, '0');

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-6 border transition-all ${
        goal.is_primary
          ? 'bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 border-blue-300 shadow-md ring-2 ring-blue-500/20'
          : 'bg-white hover:bg-slate-50/50 border-slate-200/80 shadow-sm'
      }`}
    >
      {goal.is_primary && (
        <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-bl-full pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-2xl font-extrabold text-sm flex items-center justify-center shrink-0 ${
              goal.is_primary
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {indexNumber}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {goal.skill_name}
              </h3>

              {goal.is_primary ? (
                <>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                    Primary Focus
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                    Active
                  </span>
                </>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                  Waiting Queue
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <Link
                to={`/resources?goal=${goal.id}`}
                className="hover:text-blue-600 font-medium inline-flex items-center gap-1 group"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>{goal.resource_count || 0} Saved Resources</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <span>•</span>
              <span>Added {new Date(goal.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          {goal.is_primary ? (
            <span className="px-4 py-2 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/90 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Active Lead Focus
            </span>
          ) : (
            <button
              onClick={() => onSetPrimary(goal.id)}
              className="px-4 py-2 rounded-full text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 transition-all hover:shadow-md hover:shadow-blue-500/10 flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              Set as Primary
            </button>
          )}

          <button
            onClick={() => onEdit(goal)}
            title="Edit Skill Name"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            title="Delete Goal"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
