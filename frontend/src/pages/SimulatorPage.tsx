import React, { useState, useEffect } from 'react';
import { SimulatorOption } from '../types';
import { GitCompare, TrendingUp, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  targetRoleId?: string;
  currentScore?: number;
  onSelectAction: (option: SimulatorOption) => void;
}

export const SimulatorPage: React.FC<Props> = ({ 
  userId, 
  targetRoleId = 'mle', 
  currentScore = 0.0, 
  onSelectAction 
}) => {
  const [options, setOptions] = useState<SimulatorOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSimulatorOptions(userId, targetRoleId, currentScore)
      .then(res => {
        setOptions(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [userId, targetRoleId, currentScore]);

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Simulating prospective readiness improvement paths...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <GitCompare className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white">Career What-If Simulator</h1>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Compare prospective engineering interventions before investing weeks of coding. 
          CareerLens projects the readiness score impact and explains why closing architectural and deployment gaps delivers far higher hiring ROI than building repetitive models.
        </p>
      </div>

      {/* Simulator Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((opt) => {
          const isHighRoi = opt.simulated_score_delta >= 15.0;
          return (
            <div
              key={opt.id}
              className={`p-5 rounded-2xl bg-[#141721] border transition-all flex flex-col justify-between space-y-4 ${
                isHighRoi
                  ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                  : 'border-[#222634] hover:border-[#2f3549]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1e2230] text-slate-300">
                    {opt.action_type}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+{opt.simulated_score_delta}% (Simulated)</span>
                  </div>
                </div>

                <h2 className="text-sm font-bold text-white leading-snug">{opt.title}</h2>

                <div className="p-3 rounded-xl bg-[#181c28] border border-[#252b3d] text-xs space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 block">Gap Addressed:</span>
                  <p className="text-slate-300">{opt.addresses_gap}</p>
                </div>

                <div className="text-xs space-y-1.5 text-slate-300">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Estimated Effort:</span>
                    <span className="text-white font-medium">{opt.estimated_effort}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Projected Readiness:</span>
                    <span className="text-indigo-400 font-bold">{opt.simulated_new_score}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-[#1e2333]">
                  {opt.qualitative_explanation}
                </p>

                <div className="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
                  💡 {opt.comparison_benefit}
                </div>
              </div>

              <button
                onClick={() => onSelectAction(opt)}
                className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isHighRoi
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#1e2333] hover:bg-[#252c40] text-slate-300'
                }`}
              >
                <span>Add This to My Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
