import React, { useState, useEffect } from 'react';
import { CareerRecommendation } from '../types';
import { Compass, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  onSelectRole: (roleId: string) => void;
}

export const CareerDiscoveryPage: React.FC<Props> = ({ userId, onSelectRole }) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.discoverCareers(userId)
      .then(res => {
        setRecommendations(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Evaluating candidate evidence across all career domains...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Career Discovery Engine</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Unsure about your career path? CareerLens scans your observable repository code, math modeling, and backend scripts to discover roles with the highest alignment and smallest unverified evidence gaps.
        </p>
      </div>

      {/* Role Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.slice(0, 6).map((rec, idx) => (
          <div
            key={rec.role_id}
            className="p-5 rounded-2xl bg-[#141721] border border-[#222634] hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#1e2230] text-indigo-400 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <h2 className="text-base font-bold text-white">{rec.role_name}</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-xs">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{rec.match_percentage}% Match</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {rec.suitability_rationale}
              </p>

              {/* Demonstrated vs Missing lists */}
              <div className="space-y-2 pt-2 border-t border-[#1e2333] text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                    Relevant Demonstrated Strengths:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.demonstrated_competencies.slice(0, 3).map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px]">
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                    Competencies Needing Proof:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.missing_competencies.slice(0, 3).map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                        ! {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e2333] flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {rec.recommended_next_step}
              </span>
              <button
                onClick={() => onSelectRole(rec.role_id)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-indigo-600/30"
              >
                <span>Assess This Role</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
