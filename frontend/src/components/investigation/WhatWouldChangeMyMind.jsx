import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  GitCompare,
  Clock,
  Database
} from 'lucide-react';

export function WhatWouldChangeMyMind({ counterfactuals = [], hypothesisTitle }) {
  if (!counterfactuals || counterfactuals.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        No counterfactual conditions identified yet for this hypothesis. Run analysis to populate.
      </div>
    );
  }

  const getCategoryConfig = (category) => {
    const c = (category || '').toUpperCase();
    if (c === 'STRENGTHENING') {
      return {
        label: 'Strengthening Evidence',
        desc: 'New observations that would substantially raise support for this hypothesis.',
        icon: TrendingUp,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-800',
      };
    }
    if (c === 'WEAKENING') {
      return {
        label: 'Weakening Evidence',
        desc: 'Findings that would erode credibility without direct falsification.',
        icon: TrendingDown,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        badgeColor: 'bg-amber-100 text-amber-800',
      };
    }
    if (c === 'CONTRADICTING') {
      return {
        label: 'Contradicting / Falsifying Evidence',
        desc: 'Definitive proof that would eliminate or falsify this hypothesis entirely.',
        icon: AlertOctagon,
        color: 'text-red-700 bg-red-50 border-red-200',
        badgeColor: 'bg-red-100 text-red-800',
      };
    }
    return {
      label: 'Distinguishing Evidence',
      desc: 'Critical evidence that isolates this hypothesis against competitors.',
      icon: GitCompare,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Counterfactual Analysis: "What Would Change My Mind?"
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Evaluating epistemological conditions for <span className="font-semibold text-slate-800">{hypothesisTitle || 'Current Hypothesis'}</span>. Pre-committing to evidentiary criteria prevents confirmation bias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {counterfactuals.map((item, index) => {
          const config = getCategoryConfig(item.category);
          const Icon = config.icon;

          return (
            <div
              key={item.id || index}
              className={`rounded-2xl border p-5 transition-all shadow-subtle ${config.color}`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/80 shadow-subtle">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {config.label}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${config.badgeColor}`}>
                  {item.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {item.description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.source}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.time_window}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2 italic bg-white/60 p-2.5 rounded-xl border border-slate-200/40">
                <span className="font-bold not-italic text-slate-700">Epistemic Impact: </span>
                {item.reason}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
