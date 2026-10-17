import React, { useState, useEffect } from 'react';
import { GrowthSnapshot } from '../types';
import { TrendingUp, Calendar, CheckCircle2, Award, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
}

export const GrowthPage: React.FC<Props> = ({ userId }) => {
  const [history, setHistory] = useState<GrowthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGrowthHistory(userId).then(res => {
      setHistory(res);
      setLoading(false);
    }).catch(console.error);
  }, [userId]);

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Loading GrowthDNA Timeline...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">GrowthDNA — Longitudinal Progress Timeline</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Versioned audit snapshots capturing how your observable proof of work has matured. 
          Distinguishes skills newly documented from competencies independently verified through code inspection.
        </p>
      </div>

      {/* Timeline Progression */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#252b3d]">
        {history.map((snap, idx) => (
          <div key={snap.id} className="relative space-y-3">
            {/* Timeline Circle */}
            <div className="absolute -left-[29px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[#0c0e14]"></div>

            <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#222634] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Audit Snapshot #{idx + 1}</span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{snap.date}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-400">Readiness: {snap.readiness_score}%</span>
                  <span className="text-xs text-emerald-400 font-medium">Completeness: {snap.evidence_completeness}%</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {snap.notes}
              </p>

              {snap.new_competencies && snap.new_competencies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">Newly Verified:</span>
                  {snap.new_competencies.map((comp, cIdx) => (
                    <span key={cIdx} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                      ✓ {comp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
