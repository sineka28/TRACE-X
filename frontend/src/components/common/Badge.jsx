import React from 'react';

export function Badge({ status, variant, children, className = '' }) {
  const normalized = (status || variant || children || '').toString().toUpperCase().replace(/\s+/g, '_');

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (normalized === 'SUPPORTED' || normalized === 'FOUND' || normalized === 'COMPLETED') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (normalized === 'PARTIALLY_SUPPORTED' || normalized === 'PARTIAL' || normalized === 'IN_PROGRESS') {
    bg = 'bg-teal-50 text-teal-800 border-teal-200';
    dotColor = 'bg-teal-500';
  } else if (normalized === 'UNCERTAIN' || normalized === 'INFERRED' || normalized === 'MEDIUM') {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'CONTRADICTED' || normalized === 'CONFLICTING' || normalized === 'HIGH' || normalized === 'FAILED') {
    bg = 'bg-red-50 text-red-800 border-red-200';
    dotColor = 'bg-red-500';
  } else if (normalized === 'UNKNOWN' || normalized === 'MISSING' || normalized === 'LOW' || normalized === 'INSUFFICIENT_EVIDENCE') {
    bg = 'bg-slate-100 text-slate-700 border-slate-300';
    dotColor = 'bg-slate-500';
  } else if (normalized === 'OBSERVED' || normalized === 'ACTIVE' || normalized === 'READY') {
    bg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    dotColor = 'bg-indigo-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border uppercase ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children || status || variant}
    </span>
  );
}
