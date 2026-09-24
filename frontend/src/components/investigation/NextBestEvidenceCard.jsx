import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Sparkles, MapPin, Clock, Search, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export function NextBestEvidenceCard({ item, onInvestigate }) {
  const [requested, setRequested] = useState(false);
  const toast = useToast();

  const handleInvestigate = () => {
    setRequested(true);
    toast.success(`Acquisition requisition issued for: ${item.source}`);
    if (onInvestigate) onInvestigate(item);
  };

  const infoValue = Math.round((item.heuristic_info_value || 0.8) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <Badge status={item.priority}>{item.priority} PRIORITY</Badge>
          
          {/* HEURISTIC INFORMATION VALUE */}
          <div className="flex flex-col items-end text-right">
            <span className="font-mono text-sm font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
              {infoValue}%
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
              Heuristic Info Value
            </span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-900 mt-2">
          {item.source}
        </h3>

        <div className="mt-2 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.time_window}</span>
          </div>
        </div>

        <p className="text-xs text-slate-700 mt-3 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-900">Why Investigate: </span>
          {item.reason}
        </p>

        {item.related_hypotheses && item.related_hypotheses.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.related_hypotheses.map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-semibold text-indigo-700"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 italic">
          *Heuristic ranking based on graph divergence
        </span>
        <Button
          size="sm"
          variant={requested ? 'outline' : 'primary'}
          onClick={handleInvestigate}
          disabled={requested}
          icon={requested ? CheckCircle : Search}
        >
          {requested ? 'Requisitioned' : 'Investigate Evidence'}
        </Button>
      </div>
    </div>
  );
}
