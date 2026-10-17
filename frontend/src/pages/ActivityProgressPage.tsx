import React, { useState, useEffect } from 'react';
import { ActivityConsistencySummary, DailyActivity } from '../types';
import { api } from '../services/api';
import { 
  Activity, 
  Calendar, 
  GitCommit, 
  Clock, 
  AlertTriangle, 
  Info, 
  Layers, 
  TrendingUp, 
  ShieldAlert,
  ChevronRight,
  Filter
} from 'lucide-react';

interface Props {
  userId: string;
}

export const ActivityProgressPage: React.FC<Props> = ({ userId }) => {
  const [rangeDays, setRangeDays] = useState<number>(90);
  const [consistency, setConsistency] = useState<ActivityConsistencySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.getActivityConsistency(userId, rangeDays)
      .then(res => {
        setConsistency(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, rangeDays]);

  if (loading) {
    return (
      <div className="p-12 rounded-xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
        Analyzing longitudinal activity consistency across connected sources...
      </div>
    );
  }

  if (!consistency) {
    return (
      <div className="p-8 rounded-xl bg-white border border-slate-200 text-center text-slate-500 text-xs">
        No observable activity data available. Connect GitHub or complete learning milestones.
      </div>
    );
  }

  // Weeks calculation
  const totalWeeks = Math.ceil(rangeDays / 7);
  const activeWeeksEstimate = Math.min(totalWeeks, Math.ceil(consistency.total_active_days / 2));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Activity & Longitudinal Progress
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Measures observable consistency using dated evidence from connected platforms (GitHub commits, coding updates, milestone completions).
          </p>
        </div>

        {/* Observation Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Observation Period:</label>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(parseInt(e.target.value, 10))}
            className="p-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-600"
          >
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={180}>Last 6 Months</option>
            <option value={365}>Last 1 Year</option>
          </select>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Consistency Index</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{consistency.consistency_percentage}%</span>
            <span className="text-xs text-indigo-600 font-semibold">{consistency.observation_period}</span>
          </div>
          <p className="text-[11px] text-slate-500">Days with verified work submissions</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Active Days</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{consistency.total_active_days}</span>
            <span className="text-xs text-slate-400">/ {rangeDays} total days</span>
          </div>
          <p className="text-[11px] text-slate-500">~{activeWeeksEstimate} active weeks observed</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Observed Events</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{consistency.total_observed_events}</span>
            <span className="text-xs text-emerald-600 font-semibold">Commits & Artifacts</span>
          </div>
          <p className="text-[11px] text-slate-500">Excludes unverified resume keywords</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold uppercase text-slate-400">Observation Window</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900">{consistency.start_date}</span>
            <span className="text-xs text-slate-400">to</span>
          </div>
          <div className="text-sm font-bold text-slate-900">{consistency.end_date}</div>
        </div>
      </div>

      {/* Activity Heatmap Grid */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Observable Activity Distribution</h2>
            <p className="text-xs text-slate-500">Daily intensity of commits, code submissions, and verified task deliverables</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-slate-100 border border-slate-200"></span>
            <span className="w-3 h-3 rounded-xs bg-indigo-200"></span>
            <span className="w-3 h-3 rounded-xs bg-indigo-400"></span>
            <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
          <div className="flex gap-1.5 min-w-[600px]">
            {consistency.daily_breakdown.map((day, idx) => {
              const count = day.total_activities;
              const bgClass = count > 3 ? 'bg-indigo-600 text-white' :
                              count > 1 ? 'bg-indigo-400 text-white' :
                              count > 0 ? 'bg-indigo-200 text-indigo-900' : 'bg-white border border-slate-200 text-slate-400';

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${count} observable events (${day.commit_count} commits, ${day.submission_count} submissions)`}
                  className={`w-5 h-8 rounded-xs shrink-0 flex items-center justify-center text-[9px] font-bold transition-all hover:ring-2 hover:ring-indigo-500 ${bgClass}`}
                >
                  {count > 0 ? count : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Maintenance Pattern Rationale */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
          <div className="text-xs font-bold text-indigo-950 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Observed Maintenance & Improvement Pattern</span>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed">
            {consistency.maintenance_pattern}
          </p>
        </div>
      </div>

      {/* Honest Limitations Disclosure Card (CRITICAL PER MASTER PROMPT) */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>Transparency & Limitations of Observable Data</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {consistency.limitations_disclosure}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <strong>What we measure:</strong> Public Git commits, repository frequency, branch updates, roadmap milestones verified via artifacts, and platform test submissions.
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <strong>What we never assume:</strong> A student is never penalized as inactive merely because their projects are private, offline, or conducted through internal university courseworks.
          </div>
        </div>
      </div>
    </div>
  );
};
