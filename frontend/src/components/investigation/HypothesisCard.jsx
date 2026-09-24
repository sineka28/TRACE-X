import React from 'react';
import { Badge } from '../common/Badge';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

export function HypothesisCard({
  hypothesis,
  isSelected,
  onSelect,
}) {
  const score = hypothesis.heuristic_score ?? 50;

  // Color for score gauge
  let scoreColor = 'text-amber-600 bg-amber-50 border-amber-200';
  if (score >= 65) scoreColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  else if (score < 45) scoreColor = 'text-red-700 bg-red-50 border-red-200';

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-5 border transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-white border-indigo-600 shadow-elevated ring-2 ring-indigo-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge status={hypothesis.status}>{hypothesis.status}</Badge>
            <span className="text-[11px] font-mono font-bold text-slate-400">
              ID: {hypothesis.id?.substring(0, 8) || 'HYP'}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {hypothesis.title}
          </h3>
        </div>

        {/* HEURISTIC REASONING SCORE GAUGE */}
        <div className="flex flex-col items-end flex-shrink-0 text-right">
          <div className={`px-2.5 py-1 rounded-lg border font-mono text-sm font-extrabold ${scoreColor}`}>
            {score.toFixed(1)}%
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            Heuristic Score
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 mt-2.5 font-medium leading-relaxed">
        {hypothesis.description}
      </p>

      {/* Assumptions */}
      {hypothesis.assumptions && hypothesis.assumptions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Key Assumptions:
          </span>
          <ul className="mt-1 space-y-1 text-xs text-slate-600">
            {hypothesis.assumptions.map((assump, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{assump}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Summary Badges */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{hypothesis.supporting_evidence?.length || 0} Supporting</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-700 font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          <span>{hypothesis.contradicting_evidence?.length || 0} Contradicting</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{hypothesis.missing_evidence?.length || 0} Missing</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-bold text-indigo-600 pt-2 border-t border-slate-50">
        <span>{isSelected ? 'Currently Selected' : 'Select to Inspect Expected vs Actual'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
