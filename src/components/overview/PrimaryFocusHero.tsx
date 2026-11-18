import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, BookOpen, Sparkles, Layers, PlusCircle } from 'lucide-react';
import { LearningGoal } from '../../types/database.types';

interface PrimaryFocusHeroProps {
  primaryGoal: LearningGoal | null;
  queuedGoalsCount: number;
  onOpenAddGoal: () => void;
}

export const PrimaryFocusHero: React.FC<PrimaryFocusHeroProps> = ({
  primaryGoal,
  queuedGoalsCount,
  onOpenAddGoal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-700/15 p-6 sm:p-8 lg:p-10 border border-blue-500/30">
      {/* Background Decorative Rings / Glow */}
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-10 bottom-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Goal Details */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Status Tags */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-blue-50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Focus Mode Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 backdrop-blur-md border border-white/15 text-blue-100">
              ⚡ Single-Stream Priority
            </span>
          </div>

          {/* Goal Label & Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 border border-amber-300/40 text-amber-200 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Current Goal
            </div>

            {primaryGoal ? (
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {primaryGoal.skill_name}
              </h1>
            ) : (
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90">
                  No Primary Learning Goal Selected
                </h1>
                <p className="text-sm text-blue-100/80">
                  Select a skill from your learning goals or create a new one to focus on first.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
            {primaryGoal
              ? 'Focusing exclusively on this skill to minimize cognitive task-switching latency. Organize curated materials and study without distraction.'
              : 'The core principle of Focora is single-stream learning: master one core skill before moving to the next.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {primaryGoal ? (
              <>
                <button
                  onClick={() => navigate(`/resources?goal=${primaryGoal.id}`)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 active:scale-95 transition-all shadow-md shadow-black/10 flex items-center gap-2 group"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  View Goal Resources
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </button>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{primaryGoal.resource_count || 0} Saved Materials</span>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAddGoal}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 active:scale-95 transition-all shadow-md shadow-black/10 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Set a Primary Goal
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Visual Focus Radar Graphic from Figma Screen */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Concentric subtle radar circles */}
            <div className="absolute inset-0 rounded-full border border-white/15 animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full border border-dashed border-white/20 animate-[spin_30s_linear_infinite_reverse]" />
            <div className="absolute inset-10 rounded-full border border-white/25" />
            <div className="absolute inset-16 rounded-full bg-blue-500/20 backdrop-blur-sm border border-white/30" />

            {/* Radar Center Dial */}
            <div className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-b from-blue-600 to-indigo-800 p-4 shadow-2xl border-2 border-white/40 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 shadow-inner">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-[9px] font-bold tracking-widest text-blue-200 uppercase">
                Active Focus
              </span>
              <span className="text-xs font-bold text-white max-w-[120px] truncate mt-0.5">
                {primaryGoal ? primaryGoal.skill_name : 'No Goal'}
              </span>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-[9px] font-semibold text-emerald-200 border border-emerald-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                1/1 Allocated
              </div>
            </div>

            {/* Floating Enqueued Buffer Tag */}
            <div className="absolute bottom-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[10px] font-semibold text-blue-100 flex items-center gap-1.5 shadow-lg">
              <Layers className="w-3 h-3 text-blue-200" />
              <span>BUFFER: {queuedGoalsCount} QUEUED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
