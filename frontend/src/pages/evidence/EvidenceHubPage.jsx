import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  Search,
  Filter,
  FileText,
  Video,
  Radio,
  KeyRound,
  Activity,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';

export function EvidenceHubPage() {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getAllEvidence()
      .then((data) => setEvidenceList(data || []))
      .catch(() => setEvidenceList([]))
      .finally(() => setLoading(false));
  }, []);

  const types = ['ALL', 'video', 'json', 'csv', 'log', 'txt'];

  const filtered = evidenceList.filter((item) => {
    if (typeFilter !== 'ALL' && item.file_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.extracted_text && item.extracted_text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Evidentiary Repository
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Multi-Modal Evidence Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Catalog of ingested CCTV recordings, telematics streams, access controller dumps, and microphonic sensor files.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search evidence files or text logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap uppercase transition-colors ${
                typeFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No evidence records found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/investigations/${item.investigation_id}?tab=evidence`)}
                className="p-5 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {item.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      {item.file_type}
                    </span>
                    <Badge status={item.status}>{item.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Location: {item.location || 'Perimeter'}</span>
                    <span>•</span>
                    <span>Timestamp: {item.timestamp || 'Recorded'}</span>
                  </div>
                  {item.extracted_text && (
                    <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-600 mt-2 border border-slate-100">
                      {item.extracted_text}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View in Investigation <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
