import React from 'react';
import { Info, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function SyntheticDemoBanner({ onReset, isResetting = false, className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-extrabold tracking-wider uppercase">
              SYNTHETIC DEMO DATA
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Campus Parking Incident (10:02:11 – 10:02:34)
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            This scenario demonstrates multi-modal event reconstruction across 6 sources, highlighting the critical 9-second unobserved gap (10:02:18 → 10:02:27) and competitive hypothesis scoring.
          </p>
        </div>
      </div>

      {onReset && (
        <div className="flex-shrink-0 self-end sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            loading={isResetting}
            icon={RefreshCw}
            className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100/60"
          >
            Re-seed Demo Data
          </Button>
        </div>
      )}
    </div>
  );
}
