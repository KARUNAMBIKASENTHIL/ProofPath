import React, { useState, useEffect } from 'react';
import { 
  HistoricalEvent, 
  AnalysisRecord, 
  ReportComparison 
} from '../types';
import { api } from '../services/api';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  GitCommit, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  GitCompare, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

interface Props {
  userId: string;
}

export const AnalysisHistoryPage: React.FC<Props> = ({ userId }) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [reports, setReports] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');

  // Comparison State
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [selectedReportA, setSelectedReportA] = useState<string>('');
  const [selectedReportB, setSelectedReportB] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ReportComparison | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);

  // Report inspection drawer
  const [inspectedReport, setInspectedReport] = useState<AnalysisRecord | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      api.getHistoricalEvents(userId),
      api.getAnalysisReports(userId)
    ]).then(([evts, reps]) => {
      setEvents(evts);
      setReports(reps);
      if (reps.length >= 2) {
        setSelectedReportA(reps[1].id);
        setSelectedReportB(reps[0].id);
      } else if (reps.length === 1) {
        setSelectedReportA(reps[0].id);
        setSelectedReportB(reps[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map events to date strings
  const eventsByDate = events.reduce((acc, evt) => {
    const d = evt.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(evt);
    return acc;
  }, {} as Record<string, HistoricalEvent[]>);

  // Filtered Events
  const filteredEvents = events.filter(evt => {
    const matchesDate = selectedDateStr ? evt.date === selectedDateStr : true;
    const matchesType = filterType === 'all' || evt.event_type === filterType;
    return matchesDate && matchesType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'resume_uploaded':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">Resume Upload</span>;
      case 'analysis_run':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-semibold">Analysis Run</span>;
      case 'profile_synced':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-semibold">Profile Synced</span>;
      case 'milestone_completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">Milestone Done</span>;
      case 'readiness_reassessed':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">Reassessed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">Activity</span>;
    }
  };

  const handleRunComparison = async () => {
    if (!selectedReportA || !selectedReportB) return;
    setComparing(true);
    try {
      const res = await api.compareReports(userId, selectedReportA, selectedReportB);
      setComparisonResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Calendar & Analysis History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse past readiness analyses, inspect preserved snapshots, and compare historical assessments over time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {reports.length >= 2 && (
            <button
              onClick={() => {
                setCompareModalOpen(true);
                handleRunComparison();
              }}
              className="btn-primary text-xs"
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Two Reports</span>
            </button>
          )}

          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'timeline' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline / Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Widget (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {monthName} {year}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  Today
                </button>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[11px] text-slate-400 py-1 border-b border-slate-100">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty padding days */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 rounded-lg bg-slate-50/50"></div>
              ))}

              {/* Real days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateStr] || [];
                const isSelected = selectedDateStr === dateStr;
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDateStr(isSelected ? null : dateStr)}
                    className={`h-20 sm:h-24 p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                        : hasEvents
                          ? 'border-slate-300 bg-white hover:border-indigo-300'
                          : 'border-slate-100 bg-white hover:bg-slate-50/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${hasEvents ? 'text-slate-900' : 'text-slate-400'}`}>
                        {dayNum}
                      </span>
                      {hasEvents && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div 
                          key={ev.id}
                          className="text-[9px] font-semibold truncate px-1 py-0.5 rounded bg-slate-100 text-slate-700 leading-tight"
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[8px] font-bold text-indigo-600 px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Click any date to inspect historical activities and saved reports.</span>
              {selectedDateStr && (
                <button 
                  onClick={() => setSelectedDateStr(null)}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Right Col: Events for Selected Date / Recent Events */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedDateStr ? `Events on ${selectedDateStr}` : 'All Recorded Events'}
                </h3>
                <p className="text-[11px] text-slate-500">{filteredEvents.length} records</p>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white text-slate-700"
              >
                <option value="all">All Types</option>
                <option value="resume_uploaded">Resumes</option>
                <option value="analysis_run">Analyses</option>
                <option value="profile_synced">Syncs</option>
                <option value="milestone_completed">Milestones</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredEvents.map((evt) => (
                <div 
                  key={evt.id}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                    {getEventBadge(evt.event_type)}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : evt.date}</span>
                    {evt.metadata?.score && (
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        Score: {evt.metadata.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No historical records found for the selected date or filter.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Timeline / Preserved Reports View */
        <div className="space-y-4">
          <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Saved Career Readiness Reports</h3>
                <p className="text-xs text-slate-500">Every analysis is permanently archived with its full evidence breakdown.</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{reports.length} Archived Snapshots</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Target Role</th>
                    <th className="py-3 px-4">Readiness Score</th>
                    <th className="py-3 px-4">Score Change</th>
                    <th className="py-3 px-4">Verified Skills</th>
                    <th className="py-3 px-4">Sources Available</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600">
                        {rep.date}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {rep.target_role_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold text-slate-900">
                          {rep.overall_readiness_score}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {rep.score_delta !== undefined && rep.score_delta !== null ? (
                          <span className={rep.score_delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {rep.score_delta >= 0 ? '+' : ''}{rep.score_delta}%
                          </span>
                        ) : (
                          <span className="text-slate-400">Baseline</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-700 font-semibold">{rep.supported_skills_count} verified</span>
                        <span className="text-slate-400 ml-1">/ {rep.partially_supported_count} partial</span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        {rep.sources_available?.slice(0, 2).join(', ') || 'Resume'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setInspectedReport(rep)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View Snapshot
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No saved analysis reports available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 my-auto text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Side-by-Side Analysis Comparison</h3>
              </div>
              <button 
                onClick={() => setCompareModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Baseline Report (Earlier):</label>
                <select
                  value={selectedReportA}
                  onChange={(e) => { setSelectedReportA(e.target.value); }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.date} — {r.target_role_name} ({r.overall_readiness_score}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comparison Report (Later):</label>
                <select
                  value={selectedReportB}
                  onChange={(e) => { setSelectedReportB(e.target.value); }}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.date} — {r.target_role_name} ({r.overall_readiness_score}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleRunComparison}
                disabled={comparing}
                className="btn-primary text-xs"
              >
                {comparing ? 'Calculating Progress Delta...' : 'Run Comparative Analysis'}
              </button>
            </div>

            {/* Comparison Results */}
            {comparisonResult && (
              <div className="space-y-4 pt-2 border-t border-slate-200 text-xs">
                {/* Score Delta Capsule */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-700 uppercase">Progression Overview</span>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {comparisonResult.date_a} ({comparisonResult.score_a}%) → {comparisonResult.date_b} ({comparisonResult.score_b}%)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-700">
                      {comparisonResult.score_diff >= 0 ? '+' : ''}{comparisonResult.score_diff}%
                    </span>
                    <div className="text-[10px] text-slate-500">Readiness Delta</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What Improved */}
                  <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-2">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>What Improved</span>
                    </div>
                    <ul className="space-y-1 text-emerald-800 text-[11px]">
                      {comparisonResult.what_improved.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Remaining Gaps */}
                  <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 space-y-2">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Remaining Gaps & Next Steps</span>
                    </div>
                    <ul className="space-y-1 text-amber-800 text-[11px]">
                      {comparisonResult.remaining_gaps.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* New Evidence Appeared */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>New Evidence Registered</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {comparisonResult.new_evidence_appeared.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Completed Recommendations */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Completed Recommendations</span>
                    </div>
                    <ul className="space-y-1 text-slate-700 text-[11px]">
                      {comparisonResult.completed_recommendations.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Scoring Methodology Notes */}
                <div className="p-3 rounded-lg bg-slate-100 text-[11px] text-slate-600 leading-relaxed border border-slate-200">
                  <span className="font-semibold text-slate-800">Methodology Transparency: </span>
                  {comparisonResult.scoring_methodology_notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Snapshot Drawer */}
      {inspectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{inspectedReport.target_role_name}</h3>
                  <p className="text-xs text-slate-500">{inspectedReport.date} • {inspectedReport.timestamp.slice(11, 16)} UTC</p>
                </div>
                <button onClick={() => setInspectedReport(null)} className="p-1 rounded-md text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="text-3xl font-bold text-slate-900">{inspectedReport.overall_readiness_score}%</div>
                <div className="text-xs text-indigo-700 font-semibold mt-1">Overall Job Readiness Score</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">Observation Metadata:</div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-600">
                  <div><strong>Resume Version:</strong> {inspectedReport.resume_version || 'Uploaded Resume'}</div>
                  <div><strong>Sources Available:</strong> {inspectedReport.sources_available?.join(', ') || 'Resume'}</div>
                  <div><strong>Observation Window:</strong> {inspectedReport.observation_window}</div>
                  <div><strong>Methodology:</strong> {inspectedReport.methodology_version}</div>
                </div>
              </div>

              {inspectedReport.recommendations && inspectedReport.recommendations.length > 0 && (
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Recommendations at Assessment Time:</div>
                  <ul className="space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {inspectedReport.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-indigo-600">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectedReport(null)}
              className="btn-secondary text-xs w-full"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
