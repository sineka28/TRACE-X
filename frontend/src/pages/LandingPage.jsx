import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  Clock,
  Layers,
  GitBranch,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuth();

  const handleExploreDemo = async () => {
    loginAsDemo();
    try {
      await api.seedDemo();
    } catch (e) {
      // Even if offline, demo id is fixed
    }
    navigate('/investigations/demo-campus-parking-001');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Top Navigation */}
      <header className="h-20 max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center text-white font-bold shadow-subtle">
            <Shield className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
              TRACE-X
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mt-1">
              Evidence Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Button size="sm" onClick={handleExploreDemo} icon={Sparkles}>
            Explore Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Hidden Event Reconstruction & Evidence-Seeking Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
          Reconstruct Hidden Sequences from{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800">
            Fragmented Evidence.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
          Real-world incidents leave incomplete traces across CCTV, GPS, access logs, and sensors. TRACE-X unifies disconnected data into a coherent timeline, explicitly detects unknown gaps, models competing hypotheses, and isolates the next-best evidence to acquire.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={handleExploreDemo} icon={Sparkles}>
            Explore Live Demo (Campus Incident)
          </Button>
          <Link to="/register">
            <Button size="lg" variant="outline">
              Start Investigation
            </Button>
          </Link>
        </div>

        {/* Hero Visual Pipeline Representation */}
        <div className="mt-14 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-elevated text-left">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-6 text-center">
            TRACE-X Analytical Reconstruction Workflow
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            {/* 1. Sources */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Input</div>
              <div className="text-xs font-bold text-slate-800 mt-1">CCTV • GPS • LOGS</div>
              <div className="text-[10px] text-slate-500 mt-1">Fragmented streams</div>
            </div>

            {/* 2. Events */}
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-[10px] font-bold text-indigo-500 uppercase">Extraction</div>
              <div className="text-xs font-bold text-indigo-900 mt-1">Unified Events</div>
              <div className="text-[10px] text-indigo-600 mt-1">Normalized times</div>
            </div>

            {/* 3. Unknown Gap */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300">
              <div className="text-[10px] font-bold text-amber-600 uppercase">Critical Step</div>
              <div className="text-xs font-bold text-amber-950 mt-1">Unknown Gap</div>
              <div className="text-[10px] text-amber-800 mt-1">Coverage drop</div>
            </div>

            {/* 4. Hypotheses */}
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <div className="text-[10px] font-bold text-indigo-500 uppercase">Reasoning</div>
              <div className="text-xs font-bold text-indigo-900 mt-1">Hypotheses</div>
              <div className="text-[10px] text-indigo-600 mt-1">Heuristic scores</div>
            </div>

            {/* 5. Expected vs Actual */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
              <div className="text-[10px] font-bold text-teal-600 uppercase">Matrix</div>
              <div className="text-xs font-bold text-teal-950 mt-1">Expected / Actual</div>
              <div className="text-[10px] text-teal-700 mt-1">Falsification check</div>
            </div>

            {/* 6. Next-Best */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Action</div>
              <div className="text-xs font-bold text-emerald-950 mt-1">Next-Best Evidence</div>
              <div className="text-[10px] text-emerald-700 mt-1">Targeted acquisition</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 py-16 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Epistemic Integrity
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            TRACE-X never pretends that an uncertain AI inference is an established fact. Every finding is explicitly categorized.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Unknown Gap Detection</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Automatically flags intervals where coverage was lost or sensor feeds dropped. TRACE-X never hallucinates events inside an unobserved window.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Competing Hypotheses</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Generates multiple alternative explanations for incident progression with transparent heuristic scores, assumptions, and counterfactuals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Next-Best Evidence Engine</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Calculates the heuristic information value of uncollected cameras, logs, or sensors to determine what evidence would resolve hypothesis ambiguity.
            </p>
          </div>
        </div>
      </section>

      {/* Limitations & Legal Disclaimer */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 py-12 border-t border-slate-200">
        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Notice of System Scope & Scientific Limitations
          </div>
          <p className="leading-relaxed">
            TRACE-X is an analytical assistance system and heuristic reasoning tool intended to assist human investigators. It does NOT provide legal admissibility, certified forensic authenticity, government accreditation, or guaranteed correctness. Heuristic reasoning scores reflect relative model divergence weights and must not be interpreted as statistical probabilities.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TRACE-X</span>
            <span>© 2026 Evidence Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-slate-900">Login</Link>
            <Link to="/register" className="hover:text-slate-900">Register</Link>
            <button onClick={handleExploreDemo} className="hover:text-indigo-600">Live Demo</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
