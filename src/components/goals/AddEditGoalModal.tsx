import React, { useState, useEffect } from 'react';
import { Target, AlertCircle, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { LearningGoal } from '../../types/database.types';

interface AddEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skillName: string, isPrimary: boolean) => Promise<void>;
  goalToEdit?: LearningGoal | null;
  existingGoals: LearningGoal[];
  currentPrimaryGoal?: LearningGoal | null;
}

export const AddEditGoalModal: React.FC<AddEditGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  goalToEdit,
  existingGoals,
  currentPrimaryGoal,
}) => {
  const [skillName, setSkillName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setSkillName(goalToEdit.skill_name);
        setIsPrimary(goalToEdit.is_primary);
      } else {
        setSkillName('');
        // If there's currently no primary goal, default checkbox to true for convenience
        setIsPrimary(!currentPrimaryGoal);
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, goalToEdit, currentPrimaryGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = skillName.trim();
    if (!trimmed) {
      setError('Skill name cannot be empty. Please enter a valid learning discipline.');
      return;
    }

    // Check duplicate skill name against existing goals
    const isDuplicate = existingGoals.some(
      (g) =>
        g.id !== goalToEdit?.id &&
        g.skill_name.trim().toLowerCase() === trimmed.toLowerCase()
    );

    if (isDuplicate) {
      setError(
        `Goal Conflict: "${trimmed}" is already in your learning goals. Choose a distinctive discipline.`
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(trimmed, isPrimary);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save learning goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goalToEdit ? 'Edit Learning Goal' : 'Add Goal'}
      subtitle={goalToEdit ? 'Update skill discipline settings.' : 'Choose a new skill to add to your list.'}
      icon={<Target className="w-5 h-5 text-blue-600" />}
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Skill Name Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="skill_name" className="block text-xs font-bold text-slate-800">
              Skill Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">e.g. UX/UI Design, React, Rust</span>
          </div>

          <input
            id="skill_name"
            type="text"
            required
            autoFocus
            placeholder="e.g. UX/UI Design"
            value={skillName}
            onChange={(e) => {
              setSkillName(e.target.value);
              if (error) setError(null);
            }}
            className={`w-full px-4 py-3 text-sm bg-slate-50/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-2xl border transition-all ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            } focus:outline-none`}
          />
        </div>

        {/* Duplicate or Validation Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <p className="text-[11px] text-slate-500">
          Must be distinct. You can re-sequence or reassign resources at any time.
        </p>

        {/* Set as Primary Goal Checkbox Card */}
        <label
          htmlFor="is_primary"
          className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            isPrimary
              ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-400/30'
              : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="pt-0.5">
            <input
              id="is_primary"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                isPrimary
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-300'
              }`}
            >
              {isPrimary && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-900 block">
              Set as Active Goal right now
            </span>
            <span className="text-[11px] text-slate-500 block leading-normal">
              {currentPrimaryGoal && currentPrimaryGoal.id !== goalToEdit?.id ? (
                <>
                  Will re-queue the current primary focus (
                  <span className="font-medium text-slate-700">
                    {currentPrimaryGoal.skill_name}
                  </span>
                  ) to the waiting sequence.
                </>
              ) : (
                'Enforces single-stream focus for your learning sessions.'
              )}
            </span>
          </div>
        </label>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Goal'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
