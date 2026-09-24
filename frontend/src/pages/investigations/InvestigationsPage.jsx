import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { NewInvestigationWizard } from '../../components/investigation/NewInvestigationWizard';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export function InvestigationsPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const data = await api.getInvestigations();
      setInvestigations(data);
    } catch (err) {
      toast.error('Failed to load investigations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const domains = ['ALL', 'Campus Safety', 'Transportation', 'Public Safety', 'Infrastructure', 'Security'];

  const filtered = investigations.filter((inv) => {
    if (domainFilter !== 'ALL' && inv.domain !== domainFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.title.toLowerCase().includes(q) ||
        (inv.description && inv.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Case Directory
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            Active Investigations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-modal event reconstruction workflows and evidentiary traces.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsWizardOpen(true)}>
          New Investigation
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setDomainFilter(dom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                domainFilter === dom
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Investigations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
          No investigations found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              onClick={() => navigate(`/investigations/${inv.id}`)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card hover:shadow-elevated hover:border-slate-300 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge status={inv.status}>{inv.status}</Badge>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {inv.domain}
                    </span>
                    {inv.is_synthetic_demo && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                  {inv.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {inv.description || 'No initial description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-500 font-medium">
                  <span>{inv.evidence_count || 6} Evidence</span>
                  <span>{inv.hypotheses_count || 3} Hypotheses</span>
                  <span className="text-amber-800 font-semibold">{inv.gaps_count || 1} Gap</span>
                </div>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Investigation Wizard Modal */}
      <NewInvestigationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => fetchInvestigations()}
      />
    </div>
  );
}
