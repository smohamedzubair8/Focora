import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface DeliberateQueueBannerProps {
  queuedCount: number;
  totalResources: number;
}

export const DeliberateQueueBanner: React.FC<DeliberateQueueBannerProps> = ({
  queuedCount,
  totalResources,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Deliberate Queue Protocol
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            One active primary focus at a time enforces single-stream processing and reduces cognitive switching latency.
          </p>
        </div>
      </div>

      <div className="shrink-0 pl-15 sm:pl-0">
        <div className="text-xs font-bold text-slate-800 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
          {queuedCount} Goals Queued <span className="text-slate-300 mx-1">•</span> {totalResources} Total Ingested Items
        </div>
      </div>
    </div>
  );
};
