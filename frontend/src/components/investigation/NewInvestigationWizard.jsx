import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Select, Textarea } from '../common/Input';
import { Upload, FileText, CheckCircle2, ChevronRight, ChevronLeft, X, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

const DOMAIN_OPTIONS = [
  'Campus Safety',
  'Transportation',
  'Public Safety',
  'Infrastructure',
  'Healthcare',
  'Security',
  'Other',
];

export function NewInvestigationWizard({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: 'Campus Safety',
    files: [],
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer?.files || e.target?.files || []);
    if (droppedFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...droppedFiles],
      }));
    }
  };

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error('Investigation Name is required');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Investigation
      const inv = await api.createInvestigation({
        title: formData.title,
        description: formData.description,
        domain: formData.domain,
      });

      // 2. Upload any staged files
      if (formData.files.length > 0) {
        for (const file of formData.files) {
          const fileData = new FormData();
          fileData.append('file', file);
          fileData.append('name', file.name);
          fileData.append('file_type', file.name.split('.').pop() || 'log');
          fileData.append('source_category', 'Document');
          fileData.append('location', 'Primary Incident Area');
          await api.uploadEvidence(inv.id, fileData);
        }
      }

      toast.success(`Investigation '${inv.title}' initiated successfully`);
      onClose();
      if (onSuccess) onSuccess(inv);
      navigate(`/investigations/${inv.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create investigation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Investigation"
      subtitle={`Step ${step} of 5 — Multi-Modal Evidence Initialization`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          {['Name', 'Details', 'Domain', 'Evidence', 'Review'].map((label, idx) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx + 1 === step
                    ? 'bg-indigo-600 text-white'
                    : idx + 1 < step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx + 1 < step ? '✓' : idx + 1}
              </span>
              <span className="hidden sm:inline text-xs font-semibold text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Investigation Name */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Investigation Name"
              placeholder="e.g. West Terminal Gate Anomaly"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              helperText="Give this investigation a clear, recognizable reference title."
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-4">
            <Textarea
              label="Incident Description & Initial Observations"
              rows={4}
              placeholder="Describe known incident parameters, reported locations, and initial witness or telemetry alerts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              helperText="Provide context for the AI reasoning engine to guide event extraction."
            />
          </div>
        )}

        {/* Step 3: Domain */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Investigation Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOMAIN_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, domain: d })}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    formData.domain === d
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Upload Evidence */}
        {step === 4 && (
          <div className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Upload Fragmented Evidence Files
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50"
            >
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                Drag and drop CCTV clips, sensor logs, GPS CSVs, or badge exports
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports MP4, CSV, JSON, TXT, PDF, and raw structured logs
              </p>
              <label className="mt-3 inline-block">
                <span className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-subtle hover:bg-slate-50 cursor-pointer">
                  Browse Files
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileDrop}
                  className="hidden"
                />
              </label>
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {formData.files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Review Investigation Setup</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400">Title:</span>
                <div className="font-semibold text-slate-900 mt-0.5">{formData.title || 'Untitled'}</div>
              </div>
              <div>
                <span className="font-bold uppercase text-[10px] text-slate-400">Domain:</span>
                <div className="font-semibold text-slate-900 mt-0.5">{formData.domain}</div>
              </div>
            </div>
            <div>
              <span className="font-bold uppercase text-[10px] text-slate-400">Description:</span>
              <p className="mt-0.5 text-slate-600">{formData.description || 'No description provided.'}</p>
            </div>
            <div>
              <span className="font-bold uppercase text-[10px] text-slate-400">Attached Evidence Files:</span>
              <div className="mt-0.5 font-semibold text-slate-800">
                {formData.files.length} file(s) staged for initial ingestion
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <Button
              size="sm"
              icon={ChevronRight}
              onClick={() => {
                if (step === 1 && !formData.title.trim()) {
                  toast.error('Please enter an investigation title');
                  return;
                }
                setStep(step + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              size="sm"
              loading={loading}
              onClick={handleSubmit}
              icon={CheckCircle2}
            >
              Start Investigation
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
