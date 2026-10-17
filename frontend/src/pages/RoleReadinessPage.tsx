import React, { useState, useEffect } from 'react';
import { AssessmentScoreBreakdown } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { Target, Calculator, ShieldCheck, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  currentAssessment: AssessmentScoreBreakdown | null;
  onRoleChange: (roleId: string) => void;
  selectedRoleId: string;
}

export const RoleReadinessPage: React.FC<Props> = ({
  currentAssessment,
  onRoleChange,
  selectedRoleId
}) => {
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    api.getRoles().then(setRoles).catch(console.error);
  }, []);

  if (!currentAssessment) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Loading Role Intelligence...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141721] border border-[#222634]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold text-white">Target Career Domain Assessment</h1>
          </div>
          <p className="text-xs text-slate-400">
            Compare candidate's observable evidence against configurable employer requirement profiles.
          </p>
        </div>

        {/* Role Select Dropdown */}
        <div className="relative">
          <select
            value={selectedRoleId}
            onChange={(e) => onRoleChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-[#181c28] border border-[#2a3042] text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#141721] text-white">
                {r.name} ({r.domain})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Readiness Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-1">
          <span className="text-xs text-slate-400 font-medium">Job Readiness Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{currentAssessment.overall_readiness_score}%</span>
            <span className="text-xs text-emerald-400">Calibrated v1.2</span>
          </div>
          <span className="text-[11px] text-slate-500">Sum of weighted coverage / Sum of weights</span>
        </div>

        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-1">
          <span className="text-xs text-slate-400 font-medium">Role Competencies Assessed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{currentAssessment.skill_evaluations.length}</span>
            <span className="text-xs text-indigo-400">Core Requirements</span>
          </div>
          <span className="text-[11px] text-slate-500">{currentAssessment.positive_contributors.length} verified strong</span>
        </div>

        <div className="p-4 rounded-xl bg-[#141721] border border-[#222634] space-y-1">
          <span className="text-xs text-slate-400 font-medium">Methodology Version</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-200">{currentAssessment.methodology_version}</span>
          </div>
          <span className="text-[11px] text-slate-500">Deterministic code audit & verified rubrics</span>
        </div>
      </div>

      {/* Competency Requirements & Coverage Table */}
      <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222634]">
          <h2 className="text-sm font-semibold text-white">Competency-by-Competency Evidence Matrix</h2>
          <span className="text-xs text-slate-400">
            Formula: Score = 100 × (Σ w_i × c_i) / (Σ w_i)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-[#181c28]/70 border-b border-[#222634]">
              <tr>
                <th className="py-3 px-4 font-semibold">Competency Area</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Weight (w_i)</th>
                <th className="py-3 px-4 font-semibold">Coverage (c_i)</th>
                <th className="py-3 px-4 font-semibold">Evidence Status</th>
                <th className="py-3 px-4 font-semibold">Audit Finding & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2333]">
              {currentAssessment.skill_evaluations.map((se) => (
                <tr key={se.skill_id} className="hover:bg-[#181c28]/50 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {se.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {se.category}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {se.importance_weight.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-indigo-400">
                    {se.coverage_value.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <EvidenceBadge status={se.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                    <p className="line-clamp-2">{se.evaluation_reason}</p>
                    {se.artifacts && se.artifacts.length > 0 && se.artifacts[0].file_path && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate">
                        File: {se.artifacts[0].file_path}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
