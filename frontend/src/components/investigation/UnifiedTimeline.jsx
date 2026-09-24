import React, { useState } from 'react';
import {
  Clock,
  Filter,
  Eye,
  AlertTriangle,
  HelpCircle,
  Video,
  Radio,
  KeyRound,
  Activity,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Drawer } from '../common/Drawer';

export function UnifiedTimeline({ events = [], unknownGaps = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGap, setSelectedGap] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine and sort events and gaps chronologically
  const timelineItems = [
    ...events.map((e) => ({ ...e, isGap: false })),
    ...unknownGaps.map((g) => ({
      ...g,
      isGap: true,
      timestamp: g.start_time,
      event_type: 'UNKNOWN_GAP',
      status: 'UNKNOWN',
    })),
  ].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

  const filteredItems = timelineItems.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const desc = item.description || item.significance || '';
      const type = item.event_type || '';
      const loc = item.location || '';
      return desc.toLowerCase().includes(q) || type.toLowerCase().includes(q) || loc.toLowerCase().includes(q);
    }
    return true;
  });

  const getSourceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('cctv') || t.includes('camera') || t.includes('video')) return Video;
    if (t.includes('gps') || t.includes('sensor')) return Radio;
    if (t.includes('badge') || t.includes('access') || t.includes('gate')) return KeyRound;
    return Activity;
  };

  return (
    <div className="space-y-6">
      {/* Timeline Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, locations, entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {['ALL', 'OBSERVED', 'INFERRED', 'UNKNOWN', 'CONFLICTING'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Unified Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 py-2">
        {filteredItems.map((item, index) => {
          if (item.isGap) {
            // UNKNOWN GAP DISPLAY - Distinctive striped amber-gray banner
            return (
              <div
                key={`gap-${item.id || index}`}
                onClick={() => setSelectedGap(item)}
                className="relative cursor-pointer group"
              >
                {/* Node marker */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-6 h-6 rounded-full bg-amber-500 border-4 border-white shadow-subtle flex items-center justify-center text-white ring-2 ring-amber-300">
                  <HelpCircle className="w-3 h-3 stroke-[2.5]" />
                </div>

                <div className="bg-gradient-to-r from-amber-50/90 via-slate-50 to-white border-2 border-dashed border-amber-300 rounded-2xl p-5 shadow-sm transition-all hover:shadow-card hover:border-amber-400">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-amber-500 text-white rounded-md text-[11px] font-extrabold tracking-wider uppercase">
                        UNKNOWN GAP ({item.duration})
                      </span>
                      <span className="font-mono text-xs font-bold text-amber-950">
                        {item.start_time} → {item.end_time}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 flex items-center gap-1 group-hover:underline">
                      Inspect Gap Uncertainty <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 mt-2 font-medium leading-relaxed">
                    {item.significance || 'Unmonitored interval with zero sensor or CCTV coverage.'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-wrap gap-4 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700">Preceding: </span>
                      {item.preceding_event || 'Known location'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Following: </span>
                      {item.following_event || 'Next sighting'}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Regular Normalized Event Card
          const Icon = getSourceIcon(item.event_type);
          return (
            <div
              key={`event-${item.id || index}`}
              onClick={() => setSelectedEvent(item)}
              className="relative cursor-pointer group"
            >
              {/* Node Marker */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-4 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-subtle flex items-center justify-center text-white ring-2 ring-indigo-200">
                <Icon className="w-3 h-3" />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle transition-all duration-150 hover:shadow-card hover:border-indigo-300">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {item.timestamp}
                    </span>
                    <Badge status={item.status}>{item.status}</Badge>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {item.event_type}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Conf: {Math.round((item.confidence || 1) * 100)}%
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-800 mt-2.5 font-medium leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Location:</span>
                    <span>{item.location || 'Perimeter'}</span>
                  </div>
                  {item.entities && item.entities.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Entities:</span>
                      {item.entities.map((e, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        title="Event Forensic Detail"
        subtitle={selectedEvent?.timestamp ? `Timestamp: ${selectedEvent.timestamp}` : ''}
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge status={selectedEvent.status}>{selectedEvent.status}</Badge>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                Confidence: {Math.round((selectedEvent.confidence || 1) * 100)}%
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Description</h4>
              <p className="text-sm text-slate-800 mt-1 font-medium leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Event Type</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedEvent.event_type}</p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Location</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedEvent.location || 'Perimeter'}</p>
              </div>
            </div>

            {selectedEvent.entities && (
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Tracked Entities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.entities.map((ent, i) => (
                    <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold">
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-1">
              <div className="text-slate-400 font-bold text-[10px] uppercase">Raw Event Metadata</div>
              <div>Status: {selectedEvent.status}</div>
              <div>Source ID: {selectedEvent.source_id || 'System Ingested'}</div>
              <div>Normalized: Deterministic Event Parser</div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Unknown Gap Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedGap)}
        onClose={() => setSelectedGap(null)}
        title="Unknown Gap Analysis"
        subtitle={selectedGap ? `${selectedGap.start_time} → ${selectedGap.end_time} (${selectedGap.duration})` : ''}
      >
        {selectedGap && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <div className="text-xs font-extrabold uppercase tracking-wider">Unobserved Duration</div>
              <div className="text-2xl font-bold font-mono mt-1">{selectedGap.duration}</div>
              <p className="text-xs mt-2 text-amber-800 leading-relaxed">
                TRACE-X does not invent or assume what occurred during this unobserved window. Competing hypotheses are calibrated against this interval.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Forensic Significance</h4>
              <p className="text-sm text-slate-800 mt-1 font-medium leading-relaxed">
                {selectedGap.significance}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Sensor Coverage Breakdown</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-800">Available Sensors:</span>
                  <ul className="list-disc list-inside mt-1 text-emerald-700">
                    {selectedGap.sources_available?.map((s, i) => (
                      <li key={i}>{s}</li>
                    )) || <li>No peripheral sensors recording</li>}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                  <span className="font-bold text-red-800">Missing / Unmonitored Sources:</span>
                  <ul className="list-disc list-inside mt-1 text-red-700">
                    {selectedGap.sources_missing?.map((s, i) => (
                      <li key={i}>{s}</li>
                    )) || <li>Camera B Perimeter Blindspot</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
