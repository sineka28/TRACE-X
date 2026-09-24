import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Clock,
  Files,
  GitBranch,
  TableProperties,
  Brain,
  Sparkles,
  Network,
  FileText,
  Play,
  Upload,
  Plus,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { Skeleton } from '../../components/common/Skeleton';
import { SyntheticDemoBanner } from '../../components/common/SyntheticDemoBanner';

// Domain Components
import { UnifiedTimeline } from '../../components/investigation/UnifiedTimeline';
import { HypothesisCard } from '../../components/investigation/HypothesisCard';
import { ExpectedVsActualTable } from '../../components/investigation/ExpectedVsActualTable';
import { WhatWouldChangeMyMind } from '../../components/investigation/WhatWouldChangeMyMind';
import { NextBestEvidenceCard } from '../../components/investigation/NextBestEvidenceCard';
import { EvidenceGraphView } from '../../components/investigation/EvidenceGraphView';
import { InvestigationReportView } from '../../components/investigation/InvestigationReportView';
import { AnalysisWorkflowModal } from '../../components/investigation/AnalysisWorkflowModal';

import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export function InvestigationDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [investigation, setInvestigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [selectedHypothesisIndex, setSelectedHypothesisIndex] = useState(0);

  // Graph and Report States
  const [graphData, setGraphData] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Analysis Pipeline Modal
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Upload Evidence state
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('CCTV');
  const [uploadLocation, setUploadLocation] = useState('');
  const [uploadText, setUploadText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchInvestigationData = async () => {
    try {
      setLoading(true);
      const data = await api.getInvestigation(id);
      setInvestigation(data);

      // Also fetch graph and report in parallel
      api.getEvidenceGraph(id).then(setGraphData).catch(() => {});
      api.getReport(id).then(setReportData).catch(() => {
        // If not found by ID, try investigation report
        api.getReports().then((reps) => {
          const matched = reps.find((r) => r.investigation_id === id);
          if (matched) setReportData(matched);
        }).catch(() => {});
      });
    } catch (err) {
      toast.error('Failed to load investigation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigationData();
  }, [id]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleManualUpload = async (e) => {
    e.preventDefault();
    if (!uploadName) {
      toast.error('Evidence file name required');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', uploadName);
      formData.append('source_category', uploadCategory);
      formData.append('location', uploadLocation || 'Incident Area');
      formData.append('extracted_text', uploadText);
      formData.append('file_type', uploadName.split('.').pop() || 'log');

      await api.uploadEvidence(id, formData);
      toast.success('Evidence record ingested successfully');
      setUploadName('');
      setUploadText('');
      await fetchInvestigationData();
    } catch (err) {
      toast.error(err.message || 'Evidence upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && !investigation) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Investigation Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested investigation could not be retrieved.</p>
        <div className="mt-4">
          <Button size="sm" onClick={() => navigate('/investigations')}>
            Return to Directory
          </Button>
        </div>
      </div>
    );
  }

  const selectedHypothesis =
    investigation.hypotheses && investigation.hypotheses.length > 0
      ? investigation.hypotheses[selectedHypothesisIndex] || investigation.hypotheses[0]
      : null;

  const tabsConfig = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'evidence', label: 'Evidence Sources', icon: Files, badge: investigation.evidence_files?.length || 6 },
    { id: 'timeline', label: 'Unified Timeline', icon: Clock, badge: investigation.events?.length || 6 },
    { id: 'hypotheses', label: 'Hypotheses', icon: GitBranch, badge: investigation.hypotheses?.length || 3 },
    { id: 'expected', label: 'Expected vs Actual', icon: TableProperties },
    { id: 'counterfactuals', label: 'What Would Change My Mind', icon: Brain },
    { id: 'next_best', label: 'Next-Best Evidence', icon: Sparkles, badge: investigation.next_best_evidence_items?.length || 4 },
    { id: 'graph', label: 'Evidence Graph', icon: Network },
    { id: 'report', label: 'Report', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/investigations')}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mt-0.5"
              title="Return to investigations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge status={investigation.status}>{investigation.status}</Badge>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {investigation.domain}
                </span>
                {investigation.is_synthetic_demo && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    SYNTHETIC DEMO DATA
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {investigation.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => handleTabChange('report')}
            >
              View Report
            </Button>
            <Button
              size="sm"
              icon={Play}
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-indigo-700 hover:bg-indigo-800 shadow-elevated"
            >
              Run Analysis
            </Button>
          </div>
        </div>

        {/* Demo banner if synthetic */}
        {investigation.is_synthetic_demo && (
          <SyntheticDemoBanner
            onReset={async () => {
              await api.seedDemo();
              toast.success('Synthetic Demo Data refreshed');
              await fetchInvestigationData();
            }}
          />
        )}

        {/* Tabs Bar */}
        <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Incident Context & Scope
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {investigation.description}
            </p>
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Domain</span>
                <span className="font-bold text-slate-800">{investigation.domain}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Observed Events</span>
                <span className="font-bold text-slate-800">{investigation.events?.length || 6} Events</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Critical Unknown Gaps</span>
                <span className="font-bold text-amber-800 font-mono">{investigation.unknown_gaps?.length || 1} Gap (9s)</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Competing Hypotheses</span>
                <span className="font-bold text-indigo-700">{investigation.hypotheses?.length || 3} Formulated</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts to Core Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => handleTabChange('timeline')}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-indigo-400 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Unified Timeline</h4>
              <p className="text-xs text-slate-500 mt-1">
                Examine reconstructed sequence and the 10:02:18 → 10:02:27 unobserved gap.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('hypotheses')}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-indigo-400 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                <GitBranch className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Hypotheses & Falsification</h4>
              <p className="text-xs text-slate-500 mt-1">
                Explore 3 competing interpretations scored with heuristic engine.
              </p>
            </div>

            <div
              onClick={() => handleTabChange('next_best')}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-emerald-400 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Next-Best Evidence</h4>
              <p className="text-xs text-slate-500 mt-1">
                Target high-value evidentiary sources like Camera C3 local SD storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. EVIDENCE SOURCES & FILES TAB */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Ingestion Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              Ingest New Evidence Item
            </h3>
            <form onSubmit={handleManualUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Evidence file name (e.g. CAM_C3_ALLEYWAY.mp4)"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="h-11 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="CCTV">CCTV Surveillance</option>
                <option value="GPS">GPS / Telematics</option>
                <option value="Access Control">Access Control Log</option>
                <option value="Sensor">Vibration / Motion Sensor</option>
                <option value="Statement">Witness Statement</option>
                <option value="Document">Technical Document</option>
              </select>
              <Button type="submit" size="sm" loading={isUploading} icon={Upload}>
                Ingest Record
              </Button>
            </form>
          </div>

          {/* Evidence Files List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Ingested Evidence Repository ({investigation.evidence_files?.length || 6} Items)
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {(investigation.evidence_files || []).map((file) => (
                <div key={file.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{file.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase text-[10px] font-semibold">
                        {file.file_type}
                      </span>
                      <Badge status={file.status}>{file.status}</Badge>
                    </div>
                    <div className="text-slate-500 flex items-center gap-3">
                      <span>Location: {file.location || 'Perimeter'}</span>
                      <span>•</span>
                      <span>Time: {file.timestamp || 'Recorded'}</span>
                    </div>
                    {file.extracted_text && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-1 font-mono">
                        {file.extracted_text}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {file.file_size ? `${Math.round(file.file_size / 1024)} KB` : 'Stream'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. UNIFIED TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <UnifiedTimeline
          events={investigation.events || []}
          unknownGaps={investigation.unknown_gaps || []}
        />
      )}

      {/* 4. HYPOTHESES TAB */}
      {activeTab === 'hypotheses' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Competing Hypotheses Formulation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              TRACE-X generates multiple competing interpretations calibrated against observed timestamps and the unmonitored 9-second gap. Select a hypothesis to inspect expected evidence or counterfactuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(investigation.hypotheses || []).map((hyp, index) => (
              <HypothesisCard
                key={hyp.id || index}
                hypothesis={hyp}
                isSelected={selectedHypothesisIndex === index}
                onSelect={() => setSelectedHypothesisIndex(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. EXPECTED VS ACTUAL TAB */}
      {activeTab === 'expected' && selectedHypothesis && (
        <div className="space-y-6">
          {/* Selected Hypothesis banner */}
          <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Active Evaluating Hypothesis:
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedHypothesis.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-900 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                Score: {Number(selectedHypothesis.heuristic_score).toFixed(1)}%
              </span>
            </div>
          </div>

          <ExpectedVsActualTable
            expectedItems={selectedHypothesis.expected_items || []}
          />
        </div>
      )}

      {/* 6. WHAT WOULD CHANGE MY MIND TAB */}
      {activeTab === 'counterfactuals' && selectedHypothesis && (
        <WhatWouldChangeMyMind
          counterfactuals={selectedHypothesis.counterfactuals || []}
          hypothesisTitle={selectedHypothesis.title}
        />
      )}

      {/* 7. NEXT-BEST EVIDENCE TAB */}
      {activeTab === 'next_best' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Next-Best Evidence Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Targeted recommendations ranking unexplored or uncollected evidence by Heuristic Information Value to isolate competing hypotheses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(investigation.next_best_evidence_items || []).map((item, index) => (
              <NextBestEvidenceCard key={item.id || index} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* 8. EVIDENCE GRAPH TAB */}
      {activeTab === 'graph' && (
        <EvidenceGraphView graphData={graphData} />
      )}

      {/* 9. REPORT TAB */}
      {activeTab === 'report' && (
        <InvestigationReportView
          report={reportData}
          investigation={investigation}
          events={investigation.events || []}
          unknownGaps={investigation.unknown_gaps || []}
          hypotheses={investigation.hypotheses || []}
          nextBestEvidence={investigation.next_best_evidence_items || []}
        />
      )}

      {/* 12-Step Real Pipeline Analysis Modal */}
      <AnalysisWorkflowModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        investigationId={id}
        onSuccess={async () => {
          toast.success('Investigation analysis completed');
          await fetchInvestigationData();
        }}
      />
    </div>
  );
}
