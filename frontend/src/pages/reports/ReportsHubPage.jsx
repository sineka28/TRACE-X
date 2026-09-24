import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';

export function ReportsHubPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getReports()
      .then((data) => setReports(data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Executive Syntheses
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Investigation Reports
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Formal analytical syntheses documenting unified timelines, unobserved intervals, competing hypotheses, and counterfactuals.
        </p>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No reports generated yet. Run an analysis to produce a synthesis document.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => navigate(`/investigations/${rep.investigation_id}?tab=report`)}
                className="p-5 sm:p-6 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {rep.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mt-1">
                    {rep.summary}
                  </p>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Generated: {new Date(rep.created_at).toLocaleDateString()} • Reference ID: {rep.id.substring(0, 8)}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  <Button size="sm" variant="outline" className="text-xs">
                    View & Export Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
