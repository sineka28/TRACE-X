import React, { useRef } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Printer, Download, ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export function InvestigationReportView({
  report,
  investigation,
  events = [],
  unknownGaps = [],
  hypotheses = [],
  nextBestEvidence = [],
}) {
  const printRef = useRef(null);
  const toast = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report || {}, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TRACE_X_REPORT_${investigation?.id || 'INVESTIGATION'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Report export downloaded successfully');
  };

  const legalDisclaimer =
    report?.legal_disclaimer ||
    'TRACE-X is an analytical assistance system and heuristic reasoning engine. It does not provide legal admissibility, forensic certification, government accreditation, or guaranteed correctness.';

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
            Forensic Intelligence Synthesis
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {report?.title || `Investigation Report: ${investigation?.title}`}
          </h2>
          <p className="text-xs text-slate-500">
            Generated with TRACE-X Analytical Assistance Engine
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print / PDF
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleDownloadJson}>
            Export JSON
          </Button>
        </div>
      </div>

      {/* Printable Document Sheet */}
      <div
        ref={printRef}
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-card max-w-4xl mx-auto space-y-8 text-slate-800 text-xs sm:text-sm print:p-0 print:border-none print:shadow-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold tracking-widest text-sm uppercase">
              <span>TRACE-X</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium text-xs">EVIDENCE INTELLIGENCE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {investigation?.title || 'Investigation Synthesis'}
            </h1>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <div>Domain: <span className="font-semibold text-slate-800">{investigation?.domain}</span></div>
              <div>Status: <span className="font-semibold text-slate-800">{investigation?.status}</span></div>
              <div>Generated: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] font-bold text-slate-700 block">
              REF: {investigation?.id?.substring(0, 12) || 'DEMO-001'}
            </span>
          </div>
        </div>

        {/* Legal & AI Disclaimer Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800 mb-0.5">
              Legal Admissibility & AI Reasoning Advisory
            </div>
            {legalDisclaimer}
          </div>
        </div>

        {/* 1. Executive Overview */}
        <section className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
            1. Executive Overview
          </h3>
          <p className="text-slate-700 leading-relaxed font-medium">
            {report?.summary || investigation?.description || 'Forensic analysis conducted across fragmented CCTV, access logs, and sensor telemetry.'}
          </p>
        </section>

        {/* 2. Critical Unknown Gaps */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
            2. Identified Unknown Time Gaps
          </h3>
          {unknownGaps.length === 0 ? (
            <p className="text-slate-500 italic">No unmonitored coverage gaps identified.</p>
          ) : (
            unknownGaps.map((gap, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-dashed border-amber-300 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-900 font-mono">
                    GAP: {gap.start_time} → {gap.end_time}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px]">
                    {gap.duration} Unmonitored
                  </span>
                </div>
                <p className="text-slate-700">{gap.significance}</p>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600">Missing Coverage: </span>
                  {gap.sources_missing?.join(', ') || 'Camera blindspots'}
                </div>
              </div>
            ))
          )}
        </section>

        {/* 3. Observed Events Breakdown */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
            3. Chronological Observed Events
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {events.map((ev, i) => (
              <div key={i} className="p-3 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {ev.timestamp}
                  </span>
                  <Badge status={ev.status}>{ev.status}</Badge>
                  <span className="font-medium text-slate-800">{ev.description}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {ev.location || 'Perimeter'}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Competing Hypotheses & Heuristic Scoring */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
            4. Competing Hypotheses & Heuristic Reasoning Scores
          </h3>
          <div className="space-y-3">
            {hypotheses.map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{h.title}</span>
                  <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Heuristic Score: {Number(h.heuristic_score).toFixed(1)}%
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{h.description}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-500 border-t border-slate-100">
                  <div><span className="font-bold text-emerald-700">Supporting: </span>{h.supporting_evidence?.join('; ') || 'None verified'}</div>
                  <div><span className="font-bold text-red-700">Contradicting: </span>{h.contradicting_evidence?.join('; ') || 'None identified'}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Recommended Next-Best Evidence */}
        <section className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-1">
            5. Priority Next-Best Evidence Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nextBestEvidence.map((nb, i) => (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{nb.source}</span>
                  <Badge status={nb.priority}>{nb.priority}</Badge>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{nb.location} • {nb.time_window}</div>
                <p className="text-slate-700 pt-1">{nb.reason}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Signatures & Limitations */}
        <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span>Investigator in Charge: </span>
            <span className="font-bold text-slate-700">Dr. Alex Rivera, Senior Forensic Analyst</span>
          </div>
          <div>
            <span>Analytical Engine: </span>
            <span className="font-bold text-slate-700">TRACE-X v1.0.0 (FastAPI + Gemini)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
