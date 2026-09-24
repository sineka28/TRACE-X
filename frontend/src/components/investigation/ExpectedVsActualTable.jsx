import React from 'react';
import { Badge } from '../common/Badge';
import { HelpCircle, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function ExpectedVsActualTable({ expectedItems = [] }) {
  if (!expectedItems || expectedItems.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
        No expected evidence mapped for this hypothesis yet. Run analysis to populate matrix.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'FOUND') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (s === 'PARTIAL') return <AlertTriangle className="w-4 h-4 text-teal-600" />;
    if (s === 'CONTRADICTED') return <XCircle className="w-4 h-4 text-red-600" />;
    return <HelpCircle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Expected vs Actual Forensic Matrix
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating necessary evidentiary conditions against recovered sensor logs and footage.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <th className="py-3.5 px-4 w-1/2 border-r border-slate-200">
                Expected Evidence (Predicted Condition)
              </th>
              <th className="py-3.5 px-4 w-1/2">
                Actual Evidence (Recovered Finding)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expectedItems.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50/60 transition-colors">
                {/* LEFT: EXPECTED */}
                <td className="p-4 align-top border-r border-slate-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900">{item.source_type}</span>
                    <span className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {item.time_window}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    Reason: {item.reason}
                  </p>
                </td>

                {/* RIGHT: ACTUAL */}
                <td className="p-4 align-top">
                  <div className="flex items-center gap-2 mb-1.5">
                    {getStatusIcon(item.actual_status)}
                    <Badge status={item.actual_status}>{item.actual_status}</Badge>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {item.actual_finding || 'No matching sensor record recovered in repository.'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
