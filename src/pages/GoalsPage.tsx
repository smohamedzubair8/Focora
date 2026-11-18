import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, AlertCircle, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LearningGoal } from '../types/database.types';
import { goalsService } from '../services/goalsService';
import { GoalCard } from '../components/goals/GoalCard';
import { AddEditGoalModal } from '../components/goals/AddEditGoalModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<LearningGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<LearningGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await goalsService.fetchGoals(user.id);
      setGoals(data);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message || 'Failed to fetch goals.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const primaryGoal = goals.find((g) => g.is_primary) || null;
  const secondaryGoals = goals.filter((g) => !g.is_primary);

  const handleSaveGoal = async (skillName: string, isPrimary: boolean) => {
    if (!user) return;
    if (goalToEdit) {
      await goalsService.updateGoal(user.id, goalToEdit.id, {
        skill_name: skillName,
        is_primary: isPrimary,
      });
    } else {
      await goalsService.createGoal(user.id, {
        skill_name: skillName,
        is_primary: isPrimary,
      });
    }
    await loadGoals();
  };

  const handleSetPrimary = async (goalId: string) => {
    if (!user) return;
    try {
      await goalsService.setPrimaryGoal(user.id, goalId);
      await loadGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to update primary focus.');
    }
  };

  const handleDeleteGoal = async () => {
    if (!user || !goalToDelete) return;
    setIsDeleting(true);
    try {
      await goalsService.deleteGoal(user.id, goalToDelete.id);
      setGoalToDelete(null);
      await loadGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Blue Hero Banner matching Figma design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-700/15 p-6 sm:p-8 lg:p-10 border border-blue-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-blue-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Single-Focus Prioritization
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Learning Goals & Skill Areas
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Define the disciplines you want to master. Designate one active focus to maintain cognitive momentum while keeping future tracks neatly queued.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-100 font-medium">
                {goals.length} Goals in Curriculum
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 font-medium">
                1 Active Primary Focus
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-200 font-medium">
                {secondaryGoals.length} Queued
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setGoalToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 rounded-full text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 active:scale-95 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Learning Goal
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadGoals}
            className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Learning Goals Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Start by creating your first learning goal. Set it as your primary focus to organize your saved resources and begin structured learning.
            </p>
            <button
              onClick={() => {
                setGoalToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Primary Focus Card highlighted at the top */}
            {primaryGoal && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Current Primary Learning Focus</span>
                </div>
                <GoalCard
                  goal={primaryGoal}
                  index={0}
                  onSetPrimary={handleSetPrimary}
                  onEdit={(g) => {
                    setGoalToEdit(g);
                    setIsAddModalOpen(true);
                  }}
                  onDelete={(g) => setGoalToDelete(g)}
                />
              </div>
            )}

            {/* Waiting Queue / Secondary Goals */}
            {secondaryGoals.length > 0 && (
              <div className="space-y-3 pt-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Waiting Goal Queue ({secondaryGoals.length})</span>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {secondaryGoals.map((goal, idx) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      index={idx + 1}
                      onSetPrimary={handleSetPrimary}
                      onEdit={(g) => {
                        setGoalToEdit(g);
                        setIsAddModalOpen(true);
                      }}
                      onDelete={(g) => setGoalToDelete(g)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      <AddEditGoalModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
        existingGoals={goals}
        currentPrimaryGoal={primaryGoal}
      />

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(goalToDelete)}
          onClose={() => setGoalToDelete(null)}
          onConfirm={handleDeleteGoal}
          title="Delete Learning Goal"
          itemName={goalToDelete.skill_name}
          itemType="goal"
          isPrimary={goalToDelete.is_primary}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
