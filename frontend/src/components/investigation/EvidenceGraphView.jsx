import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Maximize2,
  Filter,
  Sparkles,
  HelpCircle,
  Shield,
  Layers,
  Info
} from 'lucide-react';

// Custom Node Components
const EvidenceNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-white border-2 border-slate-300 text-left min-w-[200px] max-w-[240px]">
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-slate-400" />
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
        {data.category || 'SOURCE'}
      </span>
    </div>
    <div className="text-xs font-bold text-slate-900 leading-tight truncate">{data.label}</div>
    {data.location && <div className="text-[10px] text-slate-500 mt-1 truncate">{data.location}</div>}
  </div>
);

const EventNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-white border-2 border-indigo-400 text-left min-w-[220px] max-w-[260px]">
    <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-indigo-400" />
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-indigo-500" />
    <div className="flex items-center justify-between mb-1">
      <Badge status={data.status}>{data.status}</Badge>
      <span className="text-[10px] font-mono text-slate-400">{Math.round((data.confidence || 1) * 100)}%</span>
    </div>
    <div className="text-xs font-bold text-slate-900 leading-tight">{data.label}</div>
    <div className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-snug">{data.description}</div>
  </div>
);

const GapNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-amber-50 border-2 border-dashed border-amber-400 text-left min-w-[220px] max-w-[260px]">
    <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-amber-400" />
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-amber-500" />
    <div className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 inline-block mb-1">
      UNKNOWN GAP ({data.duration})
    </div>
    <div className="text-xs font-bold text-amber-950 leading-tight">{data.label}</div>
    <div className="text-[11px] text-amber-800 mt-1 line-clamp-2">{data.description}</div>
  </div>
);

const HypothesisNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-white border-2 border-indigo-600 text-left min-w-[240px] max-w-[280px]">
    <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-indigo-600" />
    <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-indigo-600" />
    <div className="flex items-center justify-between mb-1">
      <Badge status={data.status}>{data.status}</Badge>
      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
        {data.badge}
      </span>
    </div>
    <div className="text-xs font-bold text-slate-900 leading-tight">{data.label}</div>
    <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{data.description}</div>
  </div>
);

const ExpectedNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-white border-2 border-emerald-400 text-left min-w-[220px] max-w-[260px]">
    <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-emerald-400" />
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-mono font-bold text-slate-500">{data.time_window}</span>
      <Badge status={data.status}>{data.status}</Badge>
    </div>
    <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">{data.label}</div>
    <div className="text-[10px] text-slate-500 mt-1">Source: {data.source}</div>
  </div>
);

const NextBestNode = ({ data }) => (
  <div className="px-4 py-3 shadow-subtle rounded-xl bg-emerald-50 border-2 border-emerald-500 text-left min-w-[220px] max-w-[260px]">
    <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-emerald-500" />
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
        {data.badge}
      </span>
      <span className="text-[10px] font-mono font-bold text-emerald-800">Val: {data.info_value}</span>
    </div>
    <div className="text-xs font-bold text-emerald-950 leading-tight">{data.label}</div>
    <div className="text-[11px] text-emerald-800 mt-1 line-clamp-2">{data.reason}</div>
  </div>
);

export function EvidenceGraphView({ graphData }) {
  const nodeTypes = useMemo(
    () => ({
      evidenceNode: EvidenceNode,
      eventNode: EventNode,
      gapNode: GapNode,
      hypothesisNode: HypothesisNode,
      expectedNode: ExpectedNode,
      nextBestNode: NextBestNode,
    }),
    []
  );

  const initialNodes = graphData?.nodes || [];
  const initialEdges = (graphData?.edges || []).map((e) => ({
    ...e,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: e.style?.stroke || '#94A3B8',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="relative w-full h-[680px] bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-card">
      {/* Legend Header */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-subtle flex items-center gap-4 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Evidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Unknown Gap</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-700" />
          <span>Hypothesis</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Next-Best</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls className="!bg-white !border-slate-200 !shadow-subtle !rounded-xl" />
        <MiniMap
          nodeStrokeColor="#cbd5e1"
          nodeColor="#f8fafc"
          className="!bg-white/80 !border-slate-200 !rounded-xl"
        />
        <Background gap={18} size={1} color="#E2E8F0" />
      </ReactFlow>

      {/* Node Inspector Drawer */}
      <Drawer
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        title="Graph Node Inspector"
        subtitle={selectedNode?.data?.label || ''}
      >
        {selectedNode && (
          <div className="space-y-5 text-xs text-slate-700">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="font-bold uppercase text-slate-500">Node Type</span>
              <span className="font-mono font-semibold text-slate-900 uppercase">
                {selectedNode.type}
              </span>
            </div>

            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">{selectedNode.data?.label}</div>
              <p className="text-slate-600 leading-relaxed font-medium">
                {selectedNode.data?.description || selectedNode.data?.reason || 'No extended description.'}
              </p>
            </div>

            {selectedNode.data?.status && (
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Status</span>
                <Badge status={selectedNode.data.status}>{selectedNode.data.status}</Badge>
              </div>
            )}

            {selectedNode.data?.score !== undefined && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-950">
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  Heuristic Reasoning Score
                </span>
                <span className="text-xl font-bold font-mono mt-0.5 block">
                  {selectedNode.data.score}%
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 text-slate-500 text-[11px]">
              ID: <span className="font-mono">{selectedNode.id}</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
