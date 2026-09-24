import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

const PIPELINE_STEPS = [
  'Ingesting Evidence Sources & Streams',
  'Extracting Unstructured & Structured Events',
  'Normalizing Event Timestamps & Entities',
  'Building Unified Chronological Timeline',
  'Detecting Sensor & Coverage Unknown Gaps',
  'Generating Competing Hypotheses',
  'Generating Expected Evidentiary Conditions',
  'Comparing Expected vs Actual Findings',
  'Detecting Conflicts & Contradictions',
  'Running Counterfactual Analysis ("What Would Change My Mind")',
  'Identifying Next-Best Evidence & Information Value',
  'Building Multi-Modal Evidence Graph',
];

export function AnalysisWorkflowModal({
  isOpen,
  onClose,
  investigationId,
  onSuccess,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && !isAnalyzing && !completed) {
      setIsAnalyzing(true);
      setError(null);
      setCurrentStep(0);

      // Advance step indicator progressively while calling real backend
      let step = 0;
      timer = setInterval(() => {
        if (step < PIPELINE_STEPS.length - 2) {
          step++;
          setCurrentStep(step);
        }
      }, 350);

      // Real API Call
      api
        .runAnalysis(investigationId)
        .then((res) => {
          clearInterval(timer);
          setCurrentStep(PIPELINE_STEPS.length - 1);
          setTimeout(() => {
            setCompleted(true);
            setIsAnalyzing(false);
            if (onSuccess) onSuccess(res);
          }, 400);
        })
        .catch((err) => {
          clearInterval(timer);
          setIsAnalyzing(false);
          setError(err.message || 'Analysis pipeline encountered an error.');
        });
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, investigationId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isAnalyzing) onClose();
      }}
      title="TRACE-X Analytical Reconstruction Pipeline"
      subtitle="Executing 12-step heuristic reasoning and evidence-seeking engine"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Analysis Pipeline Interrupted</div>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              <div className="mt-3">
                <Button size="sm" variant="danger" onClick={onClose}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {PIPELINE_STEPS.map((stepText, idx) => {
                const isPast = idx < currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {isPast || (completed && idx === PIPELINE_STEPS.length - 1) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className="flex-1">{stepText}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Step {idx + 1}/12
                    </span>
                  </div>
                );
              })}
            </div>

            {completed && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pipeline synthesis completed successfully.</span>
                </div>
                <Button size="sm" onClick={onClose}>
                  View Insights
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
