import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Bookmark, AlertCircle, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LearningGoal, LearningResource, ViewMode } from '../types/database.types';
import { resourcesService } from '../services/resourcesService';
import { goalsService } from '../services/goalsService';
import { ResourceTable } from '../components/resources/ResourceTable';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceFilterBar } from '../components/resources/ResourceFilterBar';
import { AddEditResourceModal } from '../components/resources/AddEditResourceModal';
import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { FilePreviewModal } from '../components/resources/FilePreviewModal';
import { storeLocalFile } from '../utils/fileStorage';

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState<LearningResource[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & view modes
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeGoalFilter, setActiveGoalFilter] = useState<string>(searchParams.get('goal') || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<LearningResource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<LearningResource | null>(null);
  const [fileToPreview, setFileToPreview] = useState<LearningResource | null>(null);
  const [defaultGoalForNewResource, setDefaultGoalForNewResource] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize URL search params
  useEffect(() => {
    const goalParam = searchParams.get('goal');
    if (goalParam) {
      setActiveGoalFilter(goalParam);
    }
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [fetchedResources, fetchedGoals] = await Promise.all([
        resourcesService.fetchResources(user.id),
        goalsService.fetchGoals(user.id),
      ]);
      setResources(fetchedResources);
      setGoals(fetchedGoals);
    } catch (err: any) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load resources.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Client-side search and filtering for ultra-responsive feel
  const filteredResources = useMemo(() => {
    let result = [...resources];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((r) => r.title.toLowerCase().includes(q));
    }

    if (activeGoalFilter === 'unassigned') {
      result = result.filter((r) => !r.goal_id);
    } else if (activeGoalFilter && activeGoalFilter !== 'all') {
      result = result.filter((r) => r.goal_id === activeGoalFilter);
    }

    return result;
  }, [resources, searchQuery, activeGoalFilter]);

  // Compute goal counts
  const goalCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => {
      if (r.goal_id) {
        counts[r.goal_id] = (counts[r.goal_id] || 0) + 1;
      }
    });
    return counts;
  }, [resources]);

  const unassignedCount = useMemo(() => {
    return resources.filter((r) => !r.goal_id).length;
  }, [resources]);

  const assignedCount = resources.length - unassignedCount;

  // Handlers
  const handleSaveResource = async (
    title: string,
    url: string,
    goalId: string | null,
    fileObj?: File | null
  ) => {
    if (!user) return;
    const targetGoal = goals.find((g) => g.id === goalId);

    if (resourceToEdit) {
      const updated = await resourcesService.updateResource(
        user.id,
        resourceToEdit.id,
        { title, url, goal_id: goalId },
        targetGoal?.skill_name
      );
      if (fileObj) {
        await storeLocalFile(updated.id, fileObj);
      }
    } else {
      const created = await resourcesService.createResource(
        user.id,
        { title, url, goal_id: goalId },
        targetGoal?.skill_name
      );
      if (fileObj) {
        await storeLocalFile(created.id, fileObj);
      }
    }
    await loadData();
  };

  const handleDeleteResource = async () => {
    if (!user || !resourceToDelete) return;
    setIsDeleting(true);
    try {
      await resourcesService.deleteResource(user.id, resourceToDelete.id);
      setResourceToDelete(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource.');
    } finally {
      setIsDeleting(false);
    }
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

  const handleGoalFilterChange = (filter: string) => {
    setActiveGoalFilter(filter);
    if (filter === 'all') {
      searchParams.delete('goal');
    } else {
      searchParams.set('goal', filter);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchParams.set('search', query.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Hero Banner matching Figma design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-700/15 p-6 sm:p-8 lg:p-10 border border-blue-500/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-blue-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Deliberate Inventory • {resources.length} resources curated
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              My Learning Library
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
              Explore, organize, and track your learning materials to reach your goals. Connect documentation, courses, and guides directly to your focus areas.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-blue-100 font-medium">
                {unassignedCount > 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                    Sequencing status: {unassignedCount} Unassigned resource requires skill alignment
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    All resources aligned to goals
                  </>
                )}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 font-medium">
                • {assignedCount} assigned
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-200 font-medium">
                • {unassignedCount} unassigned
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              setResourceToEdit(null);
              setDefaultGoalForNewResource(activeGoalFilter !== 'all' && activeGoalFilter !== 'unassigned' ? activeGoalFilter : null);
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 rounded-full text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 active:scale-95 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Error Banner */}
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

      {/* Filter and Search Bar */}
      <ResourceFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeGoalFilter={activeGoalFilter}
        onGoalFilterChange={handleGoalFilterChange}
        goals={goals}
        totalCount={resources.length}
        unassignedCount={unassignedCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        goalCounts={goalCounts}
      />

      {/* Resources Display (Table or Grid) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        {loading && resources.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading resource library...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your Resource Library is Empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Save valuable documentation, course links, tutorials, and references so you always have study materials organized in one place.
            </p>
            <button
              onClick={() => {
                setResourceToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add First Resource
            </button>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              No resources match your search or filter criteria.
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or clear the active filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveGoalFilter('all');
                setSearchParams({});
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors inline-block"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <ResourceTable
            resources={filteredResources}
            onEdit={(r) => {
              setResourceToEdit(r);
              setIsAddModalOpen(true);
            }}
            onDelete={(r) => setResourceToDelete(r)}
            onAssignGoal={(r) => {
              setResourceToEdit(r);
              setIsAddModalOpen(true);
            }}
            onOpenFile={(r) => setFileToPreview(r)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onEdit={(r) => {
                  setResourceToEdit(r);
                  setIsAddModalOpen(true);
                }}
                onDelete={(r) => setResourceToDelete(r)}
                onAssignGoal={(r) => {
                  setResourceToEdit(r);
                  setIsAddModalOpen(true);
                }}
                onOpenFile={(r) => setFileToPreview(r)}
              />
            ))}
          </div>
        )}

        {/* Footer info matching Figma */}
        {filteredResources.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              Showing <span className="font-semibold text-slate-900">{filteredResources.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{resources.length}</span> items in active view
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="inline-flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>{g.skill_name} ({goalCounts[g.id] || 0})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Resource Modal */}
      <AddEditResourceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setResourceToEdit(null);
          setDefaultGoalForNewResource(null);
        }}
        onSave={handleSaveResource}
        resourceToEdit={resourceToEdit}
        goals={goals}
        defaultGoalId={defaultGoalForNewResource}
      />

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(resourceToDelete)}
          onClose={() => setResourceToDelete(null)}
          onConfirm={handleDeleteResource}
          title="Delete Saved Resource"
          itemName={resourceToDelete.title}
          itemType="resource"
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
