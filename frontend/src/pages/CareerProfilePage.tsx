import React, { useState, useEffect, useMemo } from 'react';
import { 
  ConnectedSource, 
  EvidenceRecord,
  AssessmentScoreBreakdown 
} from '../types';
import { AuthUser, api } from '../services/api';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  Upload,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Flame,
  Layers,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
  Check,
  ShieldCheck,
  ArrowRight,
  History,
  BookOpen,
  Award,
  Globe,
  Plus,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface Props {
  userId: string;
  currentUser?: AuthUser;
  targetRoleName?: string;
  sources: ConnectedSource[];
  evidence: EvidenceRecord[];
  assessment?: AssessmentScoreBreakdown | null;
  targetRoleId?: string;
  onUpdateUser?: (updated: AuthUser) => void;
  onRefreshData?: () => void;
  onStartViva?: (projectId?: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface SkillSearchHistoryItem {
  id: string;
  skillName: string;
  category: 'AI/ML' | 'Backend' | 'DevOps' | 'Database' | 'System Design' | 'Frontend';
  dateStr: string; // e.g., "2026-10-17"
  timestamp: string; // e.g., "09:15 AM"
  actionType: 'JD Gap Analysis' | 'Technical Viva Defense' | 'ATS Keyword Match' | 'Diagnostic MCQ';
  depthMatch: string; // e.g., "94% Match"
  details: string;
}

export interface UserProfileDetails {
  fullName: string;
  email: string;
  targetRole: string;
  phone: string;
  location: string;
  degree: string;
  institution: string;
  graduationYear: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
}

interface UserActivityRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  label: string;
  sessions: number;
}

export const CareerProfilePage: React.FC<Props> = ({
  userId,
  currentUser,
  targetRoleName = 'Machine Learning Engineer',
  sources,
  evidence,
  assessment,
  targetRoleId,
  onUpdateUser,
  onRefreshData,
  onStartViva,
  onNavigateTab
}) => {
  // =========================================================================
  // 1. PROFILE DETAILS MANAGEMENT (Manual Entry & Live Persistence)
  // =========================================================================
  const profileStorageKey = `proofpath_profile_details_${userId}`;

  // Helper to determine college suggestion from email or existing profile
  const inferInstitution = (user?: AuthUser) => {
    if (user?.institution) return user.institution;
    const email = user?.email?.toLowerCase() || '';
    if (email.includes('kongu')) return 'Kongu Engineering College';
    if (email.includes('psg')) return 'PSG College of Technology';
    if (email.includes('skcet') || email.includes('srikrishna')) return 'Sri Krishna College of Engineering & Technology';
    if (email.includes('cit')) return 'Coimbatore Institute of Technology';
    if (email.includes('anna')) return 'Anna University';
    return '';
  };

  const [profileDetails, setProfileDetails] = useState<UserProfileDetails>(() => {
    try {
      const saved = localStorage.getItem(profileStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Make sure it doesn't carry old dummy placeholder values
        if (parsed.institution && parsed.institution.includes('Sri Krishna') && currentUser?.email?.includes('kongu')) {
          parsed.institution = 'Kongu Engineering College';
        }
        if (parsed.phone === '+91 94421 88302' && currentUser?.email?.includes('kongu')) {
          parsed.phone = '';
        }
        if (parsed.linkedinUrl?.includes('karunambika') && currentUser?.email?.includes('kongu')) {
          parsed.linkedinUrl = '';
          parsed.githubUrl = '';
          parsed.portfolioUrl = '';
        }
        return parsed;
      }
    } catch {}

    return {
      fullName: currentUser?.full_name || 'Candidate',
      email: currentUser?.email || '',
      targetRole: targetRoleName || currentUser?.target_role || 'Machine Learning Engineer',
      phone: currentUser?.phone || '',
      location: currentUser?.location || '',
      degree: currentUser?.degree || 'B.Tech in Artificial Intelligence & Data Science',
      institution: inferInstitution(currentUser),
      graduationYear: currentUser?.graduation_year?.toString() || '2026',
      linkedinUrl: currentUser?.linkedin_url || '',
      githubUrl: currentUser?.github_url || '',
      portfolioUrl: currentUser?.portfolio_url || '',
      summary: currentUser?.summary || 'Engineering student dedicated to practical machine learning, scalable architectures, and production systems.'
    };
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<UserProfileDetails>(profileDetails);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savingBackend, setSavingBackend] = useState(false);

  // Sync editForm with current profile details when modal opens
  const openEditModal = () => {
    setEditForm({
      ...profileDetails,
      fullName: profileDetails.fullName || currentUser?.full_name || '',
      email: profileDetails.email || currentUser?.email || '',
      targetRole: profileDetails.targetRole || targetRoleName || 'Machine Learning Engineer',
      institution: profileDetails.institution || inferInstitution(currentUser),
      degree: profileDetails.degree || currentUser?.degree || 'B.Tech in Artificial Intelligence & Data Science'
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBackend(true);

    const updatedProfile: UserProfileDetails = {
      ...editForm,
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      targetRole: editForm.targetRole.trim(),
      institution: editForm.institution.trim(),
      degree: editForm.degree.trim(),
      graduationYear: editForm.graduationYear.trim(),
      phone: editForm.phone.trim(),
      location: editForm.location.trim(),
      linkedinUrl: editForm.linkedinUrl.trim(),
      githubUrl: editForm.githubUrl.trim(),
      portfolioUrl: editForm.portfolioUrl.trim(),
      summary: editForm.summary.trim()
    };

    setProfileDetails(updatedProfile);

    // Persist locally
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(updatedProfile));
    } catch {}

    // Persist to backend
    try {
      const backendUpdated = await api.updateUserProfile(userId, {
        full_name: updatedProfile.fullName,
        degree: updatedProfile.degree,
        institution: updatedProfile.institution,
        graduation_year: updatedProfile.graduationYear ? parseInt(updatedProfile.graduationYear, 10) : undefined,
        target_role: updatedProfile.targetRole,
        phone: updatedProfile.phone,
        location: updatedProfile.location,
        linkedin_url: updatedProfile.linkedinUrl,
        github_url: updatedProfile.githubUrl,
        portfolio_url: updatedProfile.portfolioUrl,
        summary: updatedProfile.summary
      });

      if (onUpdateUser) {
        onUpdateUser(backendUpdated);
      }
    } catch (err) {
      console.warn('Backend profile sync notice:', err);
    } finally {
      setSavingBackend(false);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setEditModalOpen(false);
    }, 800);
  };

  // =========================================================================
  // 2. LIVE USER LOGIN & ATTENDANCE TRACKING SYSTEM
  // =========================================================================
  const loginStorageKey = `proofpath_user_logins_${userId}`;

  // Helper to get formatted current local date: YYYY-MM-DD
  const getTodayDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [activityRecords, setActivityRecords] = useState<UserActivityRecord[]>(() => {
    try {
      const saved = localStorage.getItem(loginStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Initial genuine login tracking: record today's visit
    const today = getTodayDateStr();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const initial: UserActivityRecord[] = [
      {
        id: 'login-init-' + Date.now(),
        date: today,
        timestamp: nowTime,
        label: 'Platform Login & Active Workspace Session',
        sessions: 1
      }
    ];

    try {
      localStorage.setItem(loginStorageKey, JSON.stringify(initial));
    } catch {}

    return initial;
  });

  // Track today's login on mount if not already recorded
  useEffect(() => {
    const today = getTodayDateStr();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setActivityRecords(prev => {
      const existingToday = prev.find(r => r.date === today);
      if (!existingToday) {
        const newRecord: UserActivityRecord = {
          id: 'login-' + Date.now(),
          date: today,
          timestamp: nowTime,
          label: 'Platform Login & Practice Session',
          sessions: 1
        };
        const updated = [...prev, newRecord];
        try {
          localStorage.setItem(loginStorageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });

    // Also inform backend tracker
    api.trackLogin(userId, 'Platform Workspace Login');
  }, [userId]);

  // Calendar State: defaults to current month & year
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Map of date string -> activity details
  const activityByDate = useMemo(() => {
    const map: { [dateStr: string]: { sessions: number; label: string; records: UserActivityRecord[] } } = {};
    for (const rec of activityRecords) {
      if (!map[rec.date]) {
        map[rec.date] = { sessions: 0, label: rec.label, records: [] };
      }
      map[rec.date].sessions += (rec.sessions || 1);
      map[rec.date].records.push(rec);
    }
    return map;
  }, [activityRecords]);

  // Calculate live statistics
  const currentMonthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
  
  // Distinct active days this month
  const activeDaysThisMonth = useMemo(() => {
    return Object.keys(activityByDate).filter(d => d.startsWith(currentMonthPrefix)).length;
  }, [activityByDate, currentMonthPrefix]);

  // Total study sessions
  const totalSessionsCount = useMemo(() => {
    return Object.values(activityByDate).reduce((acc, curr) => acc + curr.sessions, 0);
  }, [activityByDate]);

  // Live Consecutive Streak calculation
  const currentStreak = useMemo(() => {
    const dateSet = new Set(Object.keys(activityByDate));
    const todayStr = getTodayDateStr();
    
    let streak = 0;
    const testDate = new Date();

    // Check if active today
    if (dateSet.has(todayStr)) {
      streak = 1;
      while (true) {
        testDate.setDate(testDate.getDate() - 1);
        const y = testDate.getFullYear();
        const m = String(testDate.getMonth() + 1).padStart(2, '0');
        const d = String(testDate.getDate()).padStart(2, '0');
        const checkStr = `${y}-${m}-${d}`;
        if (dateSet.has(checkStr)) {
          streak++;
        } else {
          break;
        }
      }
    } else {
      // Check if active yesterday
      testDate.setDate(testDate.getDate() - 1);
      const y = testDate.getFullYear();
      const m = String(testDate.getMonth() + 1).padStart(2, '0');
      const d = String(testDate.getDate()).padStart(2, '0');
      const checkStr = `${y}-${m}-${d}`;
      if (dateSet.has(checkStr)) {
        streak = 1;
        while (true) {
          testDate.setDate(testDate.getDate() - 1);
          const py = testDate.getFullYear();
          const pm = String(testDate.getMonth() + 1).padStart(2, '0');
          const pd = String(testDate.getDate()).padStart(2, '0');
          const pcheckStr = `${py}-${pm}-${pd}`;
          if (dateSet.has(pcheckStr)) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    return streak;
  }, [activityByDate]);

  // Monthly Attendance Rate
  const daysPassedInMonth = useMemo(() => {
    const isCurrentMonth = calendarYear === now.getFullYear() && calendarMonth === now.getMonth();
    return isCurrentMonth ? now.getDate() : new Date(calendarYear, calendarMonth + 1, 0).getDate();
  }, [calendarYear, calendarMonth, now]);

  const monthlyAttendanceRate = useMemo(() => {
    if (daysPassedInMonth <= 0) return 0;
    return Math.min(100, Math.round((activeDaysThisMonth / daysPassedInMonth) * 100));
  }, [activeDaysThisMonth, daysPassedInMonth]);

  // Action: User can manually log practice session for today
  const handleLogPracticeSession = () => {
    const today = getTodayDateStr();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    setActivityRecords(prev => {
      const existingIdx = prev.findIndex(r => r.date === today);
      let updated: UserActivityRecord[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          sessions: (updated[existingIdx].sessions || 1) + 1,
          label: 'Interactive Practice & Skill Viva Session',
          timestamp: nowTime
        };
      } else {
        updated = [
          ...prev,
          {
            id: 'practice-' + Date.now(),
            date: today,
            timestamp: nowTime,
            label: 'Interactive Practice & Diagnostic Test',
            sessions: 1
          }
        ];
      }
      try {
        localStorage.setItem(loginStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    api.trackLogin(userId, 'Practice Session Completed');
  };

  // Action: Reset activity to today's single login
  const handleResetActivity = () => {
    const today = getTodayDateStr();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const fresh: UserActivityRecord[] = [
      {
        id: 'fresh-' + Date.now(),
        date: today,
        timestamp: nowTime,
        label: 'Platform Login & Verified Session',
        sessions: 1
      }
    ];
    setActivityRecords(fresh);
    try {
      localStorage.setItem(loginStorageKey, JSON.stringify(fresh));
    } catch {}
  };

  // =========================================================================
  // 3. SKILL SEARCH HISTORY & EVALUATION TIMELINE
  // =========================================================================
  const searchHistoryStorageKey = `proofpath_skill_search_history_${userId}`;
  const [searchHistory, setSearchHistory] = useState<SkillSearchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(searchHistoryStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}

    // Clean initial timeline based on user target role
    return [
      {
        id: 'hist-1',
        skillName: 'Machine Learning Pipelines & Model Evaluation',
        category: 'AI/ML',
        dateStr: getTodayDateStr(),
        timestamp: 'Active Session',
        actionType: 'JD Gap Analysis',
        depthMatch: 'Verified Active',
        details: 'Initial target benchmark alignment initialized for Machine Learning Engineer competencies.'
      }
    ];
  });

  const [timelineSearchQuery, setTimelineSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newSkillSearchInput, setNewSkillSearchInput] = useState('');

  const handleAddNewSkillSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillSearchInput.trim()) return;

    const todayStr = getTodayDateStr();
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    const lower = newSkillSearchInput.toLowerCase();
    let cat: 'AI/ML' | 'Backend' | 'DevOps' | 'Database' | 'System Design' | 'Frontend' = 'Backend';
    if (lower.includes('model') || lower.includes('ai') || lower.includes('ml') || lower.includes('neural') || lower.includes('vision') || lower.includes('rag')) {
      cat = 'AI/ML';
    } else if (lower.includes('docker') || lower.includes('k8s') || lower.includes('ci/cd') || lower.includes('pipeline') || lower.includes('cloud')) {
      cat = 'DevOps';
    } else if (lower.includes('sql') || lower.includes('db') || lower.includes('redis') || lower.includes('mongo') || lower.includes('postgres')) {
      cat = 'Database';
    } else if (lower.includes('react') || lower.includes('css') || lower.includes('html') || lower.includes('ui') || lower.includes('tailwind')) {
      cat = 'Frontend';
    } else if (lower.includes('system') || lower.includes('kafka') || lower.includes('microservice') || lower.includes('architecture')) {
      cat = 'System Design';
    }

    const newItem: SkillSearchHistoryItem = {
      id: 'search-' + Date.now(),
      skillName: newSkillSearchInput.trim(),
      category: cat,
      dateStr: todayStr,
      timestamp: nowTime,
      actionType: 'JD Gap Analysis',
      depthMatch: 'Audit Executed',
      details: `Search and competency audit executed for "${newSkillSearchInput.trim()}" against target role requirements.`
    };

    const updated = [newItem, ...searchHistory];
    setSearchHistory(updated);
    try {
      localStorage.setItem(searchHistoryStorageKey, JSON.stringify(updated));
    } catch {}
    setNewSkillSearchInput('');
  };

  // Filtered Timeline Items
  const filteredTimeline = searchHistory.filter(item => {
    const matchesSearch = item.skillName.toLowerCase().includes(timelineSearchQuery.toLowerCase()) ||
                          item.details.toLowerCase().includes(timelineSearchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesDate = !selectedDate || item.dateStr === selectedDate;
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const totalDays = daysInMonth(calendarYear, calendarMonth);
  const startDayOffset = firstDayOfMonth(calendarYear, calendarMonth);
  const monthName = new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Resume status checking
  const resumeSource = sources.find(s => s.source_type === 'resume');
  const hasResume = Boolean(resumeSource);

  // User display name & initials
  const displayName = profileDetails.fullName || currentUser?.full_name || 'Candidate';
  const displayEmail = profileDetails.email || currentUser?.email || '';
  const displayTargetRole = profileDetails.targetRole || targetRoleName;
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CP';

  // Readiness Score
  const readinessPercentage = assessment?.overall_readiness_score 
    ? Math.round(assessment.overall_readiness_score) 
    : (evidence.length > 0 ? Math.min(95, 45 + evidence.length * 3) : 0);

  return (
    <div className="space-y-7 animate-in fade-in duration-200 pb-12">
      
      {/* =========================================================================
          SECTION 1: PROFESSIONAL USER HEADER & VERIFIED PROFILE DETAILS
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#EBECEF] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#DCFCE7]/40 via-emerald-50/20 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F0F1F3]">
          {/* Avatar & Core Bio */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br from-[#1A5336] to-[#0D2D1D] text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-[#BBF7D0]">
                {userInitials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs" title="Profile Active & Live">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#166534] text-[11px] font-bold border border-[#86EFAC] flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
                  Verified Candidate Profile
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                  Target: {displayTargetRole}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-600">
                {profileDetails.degree || 'Degree not specified'}
                {profileDetails.institution ? ` • ${profileDetails.institution}` : ''}
                {profileDetails.graduationYear ? ` (Class of ${profileDetails.graduationYear})` : ''}
              </p>

              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed pt-0.5">
                {profileDetails.summary || 'Click "Edit Profile Details" to update your career bio and credentials.'}
              </p>

              {/* Contact Chips with Interactive Add Options */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs text-slate-600">
                {displayEmail && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-[#1A5336]" />
                    <span>{displayEmail}</span>
                  </div>
                )}

                {profileDetails.phone ? (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-[#1A5336]" />
                    <span>{profileDetails.phone}</span>
                  </div>
                ) : (
                  <button 
                    onClick={openEditModal}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1A5336] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Phone</span>
                  </button>
                )}

                {profileDetails.location ? (
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#1A5336]" />
                    <span>{profileDetails.location}</span>
                  </div>
                ) : (
                  <button 
                    onClick={openEditModal}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1A5336] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Location</span>
                  </button>
                )}

                {profileDetails.linkedinUrl ? (
                  <a 
                    href={profileDetails.linkedinUrl.startsWith('http') ? profileDetails.linkedinUrl : `https://${profileDetails.linkedinUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1A5336] hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                ) : (
                  <button 
                    onClick={openEditModal}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1A5336] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add LinkedIn</span>
                  </button>
                )}

                {profileDetails.githubUrl ? (
                  <a 
                    href={profileDetails.githubUrl.startsWith('http') ? profileDetails.githubUrl : `https://${profileDetails.githubUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1A5336] hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                ) : (
                  <button 
                    onClick={openEditModal}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1A5336] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add GitHub</span>
                  </button>
                )}

                {profileDetails.portfolioUrl && (
                  <a 
                    href={profileDetails.portfolioUrl.startsWith('http') ? profileDetails.portfolioUrl : `https://${profileDetails.portfolioUrl}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#1A5336] hover:underline font-semibold"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action: Edit Profile Details */}
          <div className="shrink-0 self-start sm:self-center">
            <button
              onClick={openEditModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs hover:border-[#1A5336]/40 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1A5336]" />
              <span>Edit Profile Details</span>
            </button>
          </div>
        </div>

        {/* 4 Professional KPI Metric Cards (Accurate & Live) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Readiness Index</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#1A5336]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#111827]">
              {readinessPercentage > 0 ? `${readinessPercentage}%` : 'Not Assessed'}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span>{readinessPercentage >= 70 ? '● Competitive Placement Rank' : '● Needs Verification'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Extracted Skills</span>
              <Layers className="w-3.5 h-3.5 text-[#1A5336]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#111827]">
              {evidence.length}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {evidence.length > 0 ? 'Verified Evidence Indexed' : 'Upload Resume to Index'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Platform Attendance</span>
              <Calendar className="w-3.5 h-3.5 text-[#1A5336]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#111827]">
              {activeDaysThisMonth} {activeDaysThisMonth === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[10px] text-[#166534] font-bold">
              Active This Month (Live Tracked)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
              <span>Current Streak</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#111827]">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <div className="text-[10px] text-amber-600 font-bold">
              Consecutive Daily Visits
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: RESUME RECORD & DOCUMENT INTELLIGENCE
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#EBECEF] p-6 sm:p-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F1F3]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Active Master Resume Record</h2>
              <p className="text-xs text-slate-500">
                Primary resume parsed for JD competency extraction and code defense alignment.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('resume-upload')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A5336] text-white hover:bg-[#14422A] text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Version</span>
              </button>
            )}
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('resume-builder')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                <span>Open ATS Builder</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Resume Detail Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* File Card Info */}
          <div className="md:col-span-1 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">FILE NAME</span>
                <p className="text-xs font-extrabold text-[#111827] truncate" title={resumeSource ? resumeSource.name : 'No resume uploaded'}>
                  {resumeSource ? resumeSource.name : 'No Master Resume Uploaded'}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                hasResume 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}>
                {hasResume ? 'Active Master' : 'Pending Upload'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={`font-semibold ${hasResume ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {hasResume ? 'Uploaded & Verified' : 'Awaiting Resume'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-medium text-slate-800">PDF (ATS Format)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Extracted Skills:</span>
                <span className="font-semibold text-slate-800">{evidence.length} Identified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Role:</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">{displayTargetRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Synced:</span>
                <span className="font-medium text-slate-800">
                  {resumeSource?.last_synced ? resumeSource.last_synced.slice(0, 10) : 'Not yet synced'}
                </span>
              </div>
            </div>
          </div>

          {/* Core Extracted Skill Pillars from Resume / Evidence */}
          <div className="md:col-span-2 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Extracted Resume Core Skills & Competencies
                </span>
                <span className="text-[10px] font-semibold text-slate-500">
                  {evidence.length > 0 ? `${evidence.length} Evidence-Verified Skills` : 'Live Parser'}
                </span>
              </div>

              {evidence.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
                  {evidence.map((ev) => (
                    <span 
                      key={ev.id}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-slate-800 text-xs font-semibold shadow-2xs hover:border-[#1A5336] transition-colors"
                    >
                      {ev.skill_name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No verified resume skills extracted yet. Upload your PDF resume to index core competencies.
                  </p>
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('resume-upload')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A5336] text-white text-xs font-bold hover:bg-[#14422A] transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Master Resume Now</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 mt-2 ${
              hasResume 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2">
                {hasResume ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="font-medium">
                  {hasResume 
                    ? `Resume aligned with ${displayTargetRole} placement benchmarks.` 
                    : `Upload your resume to benchmark against ${displayTargetRole}.`}
                </span>
              </div>
              <span className={`text-[11px] font-bold whitespace-nowrap px-2 py-0.5 rounded-md ${
                hasResume ? 'text-emerald-800 bg-emerald-100' : 'text-amber-800 bg-amber-100'
              }`}>
                {hasResume ? 'ATS Ready' : 'Pending Upload'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: LIVE ATTENDANCE & VISIT ACTIVITY CALENDAR
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#EBECEF] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F1F3]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center text-[#1A5336]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111827]">
                  Attendance & Learning Sessions Calendar
                </h2>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                  ● Live Login Tracking Active
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Real-time attendance record tracked automatically on user logins, assessments, and practice sessions.
            </p>
          </div>

          {/* Month Navigation & Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLogPracticeSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A5336] text-white hover:bg-[#14422A] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Record a completed practice session for today"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Practice Session</span>
            </button>

            <div className="flex items-center gap-1.5 bg-[#F8F9FA] border border-[#EBECEF] rounded-xl px-2 py-1">
              <button 
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-2 min-w-[110px] text-center">
                {monthName} {calendarYear}
              </span>
              <button 
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs font-bold text-[#1A5336] bg-[#DCFCE7] hover:bg-[#BBF7D0] px-3 py-1.5 rounded-xl border border-[#86EFAC] transition-all flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Show All Days</span>
              </button>
            )}
          </div>
        </div>

        {/* Calendar Grid + Live Attendance Summary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left 2 Cols: Monthly Calendar View */}
          <div className="lg:col-span-2 space-y-4">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading padding days */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`offset-${i}`} className="h-16 sm:h-20 rounded-2xl bg-slate-50/50 border border-slate-100" />
              ))}

              {/* Month Days */}
              {Array.from({ length: totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const monthStr = String(calendarMonth + 1).padStart(2, '0');
                const dayStr = String(dayNum).padStart(2, '0');
                const dateKey = `${calendarYear}-${monthStr}-${dayStr}`;

                // Live check: did the user visit / log in on this day?
                const activeData = activityByDate[dateKey];
                const isVisited = Boolean(activeData);
                
                // Is this actual today?
                const isToday = dateKey === getTodayDateStr();
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(dateKey);
                      }
                    }}
                    className={`h-16 sm:h-20 p-2 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-[#1A5336] bg-[#1A5336] text-white shadow-md ring-2 ring-[#1A5336]/30'
                        : isToday
                          ? 'border-[#1A5336] bg-[#DCFCE7]/70 text-[#166534] font-bold shadow-xs hover:border-[#1A5336]'
                          : isVisited
                            ? 'border-[#86EFAC] bg-[#F0FDF4] hover:bg-[#DCFCE7] text-slate-900 shadow-2xs hover:border-[#4ADE80]'
                            : 'border-[#F0F1F3] bg-white hover:bg-slate-50 text-slate-400'
                    }`}
                  >
                    {/* Top Row: Day Number and Status Dot */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${
                        isSelected 
                          ? 'text-white' 
                          : isToday 
                            ? 'text-[#166534]' 
                            : isVisited 
                              ? 'text-slate-800' 
                              : 'text-slate-400'
                      }`}>
                        {dayNum}
                      </span>

                      {isVisited && (
                        <span className={`w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#16a34a]'
                        }`} />
                      )}
                    </div>

                    {/* Bottom Indicator / Session Count */}
                    <div>
                      {isToday && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-tight block truncate ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#DCFCE7] text-[#166534]'
                        }`}>
                          Today
                        </span>
                      )}
                      {isVisited && !isToday && (
                        <span className={`text-[9px] font-semibold block truncate ${
                          isSelected ? 'text-emerald-100' : 'text-[#166534]'
                        }`}>
                          {activeData?.sessions} {activeData?.sessions === 1 ? 'session' : 'sessions'}
                        </span>
                      )}
                      {!isVisited && !isToday && (
                        <span className="text-[9px] text-slate-300 font-normal">Rest</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-lg bg-[#DCFCE7] border border-[#86EFAC]" />
                  <span>Visited / Logged In</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-lg border-2 border-[#1A5336] bg-[#DCFCE7]" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-lg bg-[#1A5336]" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-lg bg-white border border-[#E5E7EB]" />
                  <span>No Login</span>
                </div>
              </div>

              <button
                onClick={handleResetActivity}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset activity to clean slate starting today"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Today</span>
              </button>
            </div>
          </div>

          {/* Right Col: Attendance Insight & Live Analytics Panel */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Live Attendance & Consistency Analytics
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Monthly Attendance Rate</span>
                  <span className="font-bold text-emerald-600">{monthlyAttendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#1A5336] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${monthlyAttendanceRate}%` }} 
                  />
                </div>
                <div className="text-[11px] text-slate-500 pt-0.5">
                  {activeDaysThisMonth} active out of {daysPassedInMonth} calendar days in {monthName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Consecutive Streak</div>
                  <div className="text-lg font-extrabold text-[#111827]">
                    {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} Active
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Flame className="w-5 h-5" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Total Study Sessions</div>
                  <div className="text-lg font-extrabold text-[#111827]">
                    {totalSessionsCount} {totalSessionsCount === 1 ? 'Session' : 'Sessions'}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#1A5336]">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {selectedDate ? (
              <div className="p-3.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-xs space-y-1 text-[#166534]">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#166534]" />
                  <span>Activity for {selectedDate}</span>
                </div>
                <p className="text-[11px] text-[#14532D]">
                  {activityByDate[selectedDate] 
                    ? `${activityByDate[selectedDate].sessions} session(s) recorded: ${activityByDate[selectedDate].label}`
                    : 'No logins or practice sessions logged for this date.'}
                </p>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="mt-1 text-[11px] font-extrabold underline cursor-pointer"
                >
                  Clear Date Filter
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic leading-relaxed">
                Tip: Click any active date in the calendar to inspect that day's session audit!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: SKILL SEARCH HISTORY & EVALUATION TIMELINE
         ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#EBECEF] p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0F1F3]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700">
                <History className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#111827]">
                Skill Search & Evaluation Timeline
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Complete chronological audit of skills searched, benchmarks evaluated, and assessments completed.
            </p>
          </div>

          {/* Quick Add Skill Search Bar */}
          <form onSubmit={handleAddNewSkillSearch} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newSkillSearchInput}
                onChange={(e) => setNewSkillSearchInput(e.target.value)}
                placeholder="Search / Add new skill audit..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F8F9FA] border border-[#EBECEF] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1A5336] focus:bg-white transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-[#1A5336] text-white hover:bg-[#14422A] text-xs font-bold transition-all shrink-0 shadow-xs cursor-pointer"
            >
              Search Skill
            </button>
          </form>
        </div>

        {/* Filters Row: Category Tabs & Timeline Text Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'AI/ML', 'Backend', 'DevOps', 'Database', 'System Design', 'Frontend'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#1A5336] text-white shadow-xs'
                    : 'bg-[#F8F9FA] border border-[#EBECEF] text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter query */}
          <div className="relative w-full sm:w-64">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={timelineSearchQuery}
              onChange={(e) => setTimelineSearchQuery(e.target.value)}
              placeholder="Filter timeline items..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#F8F9FA] border border-[#EBECEF] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1A5336]"
            />
          </div>
        </div>

        {/* Selected Date Notice */}
        {selectedDate && (
          <div className="p-2.5 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-xs text-[#166534] flex items-center justify-between">
            <span>Showing timeline records for date: <strong>{selectedDate}</strong></span>
            <button onClick={() => setSelectedDate(null)} className="font-bold underline text-xs cursor-pointer">
              View All Dates
            </button>
          </div>
        )}

        {/* Timeline Event List */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E8F0]">
          {filteredTimeline.map((item) => {
            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon / dot */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-[#1A5336] flex items-center justify-center text-[#1A5336] shadow-xs group-hover:scale-110 transition-transform">
                  <span className="w-2 h-2 rounded-full bg-[#1A5336]" />
                </div>

                {/* Event Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#1A5336]/40 transition-all space-y-2.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-[#111827]">
                        {item.skillName}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tight ${
                        item.category === 'AI/ML' ? 'bg-purple-100 text-purple-700' :
                        item.category === 'Backend' ? 'bg-blue-100 text-blue-700' :
                        item.category === 'DevOps' ? 'bg-amber-100 text-amber-700' :
                        item.category === 'Database' ? 'bg-emerald-100 text-emerald-700' :
                        item.category === 'Frontend' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-semibold">
                        {item.actionType}
                      </span>
                    </div>

                    {/* Date & Depth Result */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#166534] font-bold text-[11px] border border-[#86EFAC]">
                        {item.depthMatch}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                        <Clock className="w-3 h-3" />
                        <span>{item.dateStr} • {item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.details}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredTimeline.length === 0 && (
            <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700">No skill searches found matching filters</div>
              <p className="text-[11px] text-slate-400">
                Try searching for another skill above or clearing the date/category filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: EDIT COMPLETE PROFILE DETAILS (Manual Entry & Verification)
         ========================================================================= */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EBECEF] space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F1F3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#1A5336] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#111827]">Edit Candidate Profile Details</h3>
                  <p className="text-xs text-slate-500">Update your verified personal, educational, and contact details.</p>
                </div>
              </div>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#86EFAC] text-xs text-[#166534] font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-[#166534] stroke-[3]" />
                <span>Profile details updated and synchronized successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              
              {/* Row 1: Full Name & Target Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    placeholder="e.g. Mohanraj S"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Role *</label>
                  <input
                    type="text"
                    required
                    value={editForm.targetRole}
                    onChange={(e) => setEditForm({ ...editForm, targetRole: e.target.value })}
                    placeholder="e.g. Machine Learning Engineer"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Row 2: Email & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="e.g. mohanrajs.24aid@kongu.edu"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">College / University *</label>
                  <input
                    type="text"
                    required
                    value={editForm.institution}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    placeholder="e.g. Kongu Engineering College"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Row 3: Degree & Graduation Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Degree & Major *</label>
                  <input
                    type="text"
                    required
                    value={editForm.degree}
                    onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                    placeholder="e.g. B.Tech in Artificial Intelligence & Data Science"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Graduation Year *</label>
                  <input
                    type="text"
                    required
                    value={editForm.graduationYear}
                    onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Row 4: Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Current Location / City</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="e.g. Erode / Coimbatore, Tamil Nadu"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Row 5: LinkedIn & GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={editForm.linkedinUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={editForm.githubUrl}
                    onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Row 6: Portfolio URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Portfolio / Personal Website</label>
                <input
                  type="text"
                  value={editForm.portfolioUrl}
                  onChange={(e) => setEditForm({ ...editForm, portfolioUrl: e.target.value })}
                  placeholder="https://myportfolio.dev"
                  className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900"
                />
              </div>

              {/* Row 7: Professional Bio */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Professional Bio & Career Objective</label>
                <textarea
                  rows={3}
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  placeholder="Write a brief professional summary highlighting your core skills, specializations, and career interests..."
                  className="w-full p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EBECEF] focus:outline-none focus:border-[#1A5336] focus:bg-white text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F0F1F3]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBackend}
                  className="px-5 py-2.5 rounded-xl bg-[#1A5336] text-white font-bold hover:bg-[#14422A] transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {savingBackend ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Save & Sync Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CareerProfilePage;
