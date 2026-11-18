import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Lock, ArrowUpRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { LearningGoal } from '../../types/database.types';

interface GoalQueueListProps {
  goals: LearningGoal[];
  onSetPrimary: (goalId: string) => Promise<void>;
  onEditGoal: (goal: LearningGoal) => void;
  onDeleteGoal: (goal: LearningGoal) => void;
  onOpenAddGoal: () => void;
}

export const GoalQueueList: React.FC<GoalQueueListProps> = ({
  goals,
  onSetPrimary,
  onEditGoal,
  onDeleteGoal,
  onOpenAddGoal,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col h-full">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Study Goals</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential priority queue with strict single-focus execution
          </p>
        </div>
        <Link
          to="/goals"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          View all <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Goals list */}
      <div className="mt-5 space-y-3.5 flex-1">
        {goals.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500">No learning goals added yet.</p>
            <button
              onClick={onOpenAddGoal}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Goal
            </button>
          </div>
        ) : (
          goals.slice(0, 5).map((goal, index) => {
            const indexNumber = String(index + 1).padStart(2, '0');
            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-all ${
                  goal.is_primary
                    ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-500/20'
                    : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    {/* Number Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        goal.is_primary
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {indexNumber}
                    </div>

                    {/* Skill Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {goal.skill_name}
                        </span>

                        {goal.is_primary ? (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                              Primary
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                              Active Focus
                            </span>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600">
                            Secondary Goal
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>• {goal.resource_count || 0} Resources</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {goal.is_primary ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                        <Lock className="w-3 h-3 text-amber-600" /> Current Lead
                      </span>
                    ) : (
                      <button
                        onClick={() => onSetPrimary(goal.id)}
                        className="px-3 py-1 rounded-full text-xs font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 transition-all hover:shadow-sm"
                      >
                        Set as Primary
                      </button>
                    )}

                    <button
                      onClick={() => onEditGoal(goal)}
                      title="Edit Goal"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal)}
                      title="Delete Goal"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {goals.length > 5 && (
        <div className="pt-4 text-center border-t border-slate-100 mt-4">
          <Link
            to="/goals"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            + {goals.length - 5} more goals in waiting queue
          </Link>
        </div>
      )}
    </div>
  );
};
