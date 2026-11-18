import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Target, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LearningGoal, LearningResource } from '../types/database.types';
import { goalsService } from '../services/goalsService';
import { resourcesService } from '../services/resourcesService';
import { PrimaryFocusHero } from '../components/overview/PrimaryFocusHero';
import { MetricCards } from '../components/overview/MetricCards';
import { GoalQueueList } from '../components/overview/GoalQueueList';
import { RecentSavedResources } from '../components/overview/RecentSavedResources';
import { DeliberateQueueBanner } from '../components/overview/DeliberateQueueBanner';
import { AddEditGoalModal } from '../components/goals/AddEditGoalModal';
import { AddEditResourceModal } from '../components/resources/AddEditResourceModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { FilePreviewModal } from '../components/resources/FilePreviewModal';
import { storeLocalFile } from '../utils/fileStorage';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<LearningGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<LearningGoal | null>(null);

  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<LearningResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [fetchedGoals, fetchedResources] = await Promise.all([
        goalsService.fetchGoals(user.id),
        resourcesService.fetchResources(user.id),
      ]);
      setGoals(fetchedGoals);
      setResources(fetchedResources);
    } catch (err: any) {
      console.error('Error loading overview data:', err);
      setError(err.message || 'Failed to load application data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const primaryGoal = goals.find((g) => g.is_primary) || null;
  const queuedGoals = goals.filter((g) => !g.is_primary);
  const assignedResourcesCount = resources.filter((r) => r.goal_id).length;

  // Handlers for goals
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
    await loadData();
  };

  const handleSetPrimary = async (goalId: string) => {
    if (!user) return;
    try {
      await goalsService.setPrimaryGoal(user.id, goalId);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Could not update primary focus.');
    }
  };

  const handleDeleteGoal = async () => {
    if (!user || !goalToDelete) return;
    setIsDeleting(true);
    try {
      await goalsService.deleteGoal(user.id, goalToDelete.id);
      setGoalToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete goal.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handlers for resources
  const handleSaveResource = async (
    title: string,
    url: string,
    goalId: string | null,
    fileObj?: File | null
  ) => {
    if (!user) return;
    const targetGoal = goals.find((g) => g.id === goalId);
    const created = await resourcesService.createResource(
      user.id,
      { title, url, goal_id: goalId },
      targetGoal?.skill_name
    );
    if (fileObj) {
      await storeLocalFile(created.id, fileObj);
    }
    await loadData();
  };

  const handleUpdateFileContent = async (resourceId: string, newUrl: string) => {
    if (!user) return;
    const target = resources.find((r) => r.id === resourceId);
    if (!target) return;
    await resourcesService.updateResource(
      user.id,
      resourceId,
      { title: target.title, url: newUrl, goal_id: target.goal_id },
      target.learning_goals?.skill_name
    );
    await loadData();
    setFileToPreview((prev) => (prev ? { ...prev, url: newUrl } : null));
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            Knowledge Repository / Active Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            My Study Plan
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGoalToEdit(null);
              setIsAddGoalOpen(true);
            }}
            className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Target className="w-3.5 h-3.5 text-blue-600" />
            New Goal
          </button>

          <button
            onClick={() => setIsAddResourceOpen(true)}
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {loading && goals.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Loading your study plan...</p>
        </div>
      ) : (
        <>
          {/* Hero Banner: Primary Learning Focus */}
          <PrimaryFocusHero
            primaryGoal={primaryGoal}
            queuedGoalsCount={queuedGoals.length}
            onOpenAddGoal={() => {
              setGoalToEdit(null);
              setIsAddGoalOpen(true);
            }}
          />

          {/* Metric Cards Row */}
          <MetricCards
            primaryGoal={primaryGoal}
            queuedCount={queuedGoals.length}
            totalResources={resources.length}
            assignedResources={assignedResourcesCount}
          />

          {/* Two Column Grid: Goals on Left, Resources on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <GoalQueueList
              goals={goals}
              onSetPrimary={handleSetPrimary}
              onEditGoal={(goal) => {
                setGoalToEdit(goal);
                setIsAddGoalOpen(true);
              }}
              onDeleteGoal={(goal) => setGoalToDelete(goal)}
              onOpenAddGoal={() => {
                setGoalToEdit(null);
                setIsAddGoalOpen(true);
              }}
            />

            <RecentSavedResources
              resources={resources}
              onOpenAddResource={() => setIsAddResourceOpen(true)}
              onOpenFile={(r) => setFileToPreview(r)}
            />
          </div>

          {/* Deliberate Queue Protocol Banner */}
          <DeliberateQueueBanner
            queuedCount={queuedGoals.length}
            totalResources={resources.length}
          />
        </>
      )}

      {/* Add / Edit Goal Modal */}
      <AddEditGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => {
          setIsAddGoalOpen(false);
          setGoalToEdit(null);
        }}
        onSave={handleSaveGoal}
        goalToEdit={goalToEdit}
        existingGoals={goals}
        currentPrimaryGoal={primaryGoal}
      />

      {/* Add Resource Modal */}
      <AddEditResourceModal
        isOpen={isAddResourceOpen}
        onClose={() => setIsAddResourceOpen(false)}
        onSave={handleSaveResource}
        goals={goals}
        defaultGoalId={primaryGoal?.id || null}
      />

      {/* Delete Goal Confirmation Modal */}
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

      {/* File Preview & Download Modal */}
      {fileToPreview && (
        <FilePreviewModal
          isOpen={Boolean(fileToPreview)}
          onClose={() => setFileToPreview(null)}
          resource={fileToPreview}
          onUpdateFileContent={handleUpdateFileContent}
        />
      )}
    </div>
  );
};
