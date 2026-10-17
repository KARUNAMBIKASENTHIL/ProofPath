import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { CareerProfilePage } from './pages/CareerProfilePage';
import { SkillAnalysisPage } from './pages/SkillGapPage';
import { SkillBridgeAssessmentFlow } from './components/SkillBridgeAssessmentFlow';
import { InstantResumeBuilderPage } from './pages/InstantResumeBuilderPage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { PlacementPage } from './pages/PlacementPage';

import { AssessmentScoreBreakdown, ConnectedSource, EvidenceRecord } from './types';
import { api, AuthUser } from './services/api';

export const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authRole, setAuthRole] = useState<'student' | 'placement_officer' | 'recruiter'>('student');
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Application Navigation: Role-driven initial tab (Dashboard as central hub)
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [targetRoleId, setTargetRoleId] = useState<string>('mle');
  const [targetRoleName, setTargetRoleName] = useState<string>('Machine Learning Engineer');

  // Assessment flow modal state
  const [isAssessmentFlowOpen, setIsAssessmentFlowOpen] = useState<boolean>(false);
  const [activeProjectIdForViva, setActiveProjectIdForViva] = useState<string | null>(null);

  // User Domain Data
  const [assessment, setAssessment] = useState<AssessmentScoreBreakdown | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [reassessed, setReassessed] = useState<boolean>(false);

  // Helper to resolve landing tab based on role
  const getLandingTabForUser = (user: AuthUser): string => {
    if (user.role === 'placement_officer' || user.role === 'recruiter') {
      return 'placement';
    }
    // Student directly enters Dashboard with Skill Lag Chart & Roadmap
    return 'dashboard';
  };

  // Check login on startup
  useEffect(() => {
    const saved = api.getSavedUser();
    if (saved) {
      setCurrentUser(saved);
      if (saved.target_role) setTargetRoleName(saved.target_role);
      setCurrentTab(getLandingTabForUser(saved));
      api.trackLogin(saved.id);
    }
    api.getCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        if (user.target_role) setTargetRoleName(user.target_role);
        setCurrentTab(getLandingTabForUser(user));
        api.trackLogin(user.id);
      }
      setCheckingAuth(false);
    }).catch(() => {
      setCheckingAuth(false);
    });
  }, []);

  // Load user data whenever user or target role changes
  const loadUserData = async (userId: string, roleId = targetRoleId) => {
    try {
      const [assRes, evRes, srcRes] = await Promise.all([
        api.getLatestAssessment(userId, roleId).catch(() => null),
        api.getEvidence(userId).catch(() => []),
        api.getSources(userId).catch(() => [])
      ]);
      setAssessment(assRes);
      setEvidence(evRes);
      setSources(srcRes);
      if (assRes?.role_name) setTargetRoleName(assRes.role_name);
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadUserData(currentUser.id, targetRoleId);
    }
  }, [currentUser, targetRoleId]);

  const handleRoleChange = (roleId: string) => {
    setTargetRoleId(roleId);
    if (currentUser) {
      loadUserData(currentUser.id, roleId);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAssessment(null);
    setEvidence([]);
    setSources([]);
    setCurrentTab('dashboard');
    setIsAssessmentFlowOpen(false);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    if (user.target_role) setTargetRoleName(user.target_role);
    setCurrentTab(getLandingTabForUser(user));
    loadUserData(user.id, targetRoleId);
  };

  const handleMilestoneReassessment = async () => {
    if (!currentUser) return;
    try {
      const res = await api.reassessWithMilestone(currentUser.id, 'milestone-1', {
        repo_url: 'https://github.com/my-project/blob/main/Dockerfile',
        artifact: 'Dockerfile'
      });
      setAssessment(res.updated_assessment);
      setReassessed(true);
      const updatedEv = await api.getEvidence(currentUser.id);
      setEvidence(updatedEv);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssessmentCompleted = (newRoleId: string, newAssessment: AssessmentScoreBreakdown) => {
    setTargetRoleId(newRoleId);
    setTargetRoleName(newAssessment.role_name);
    setAssessment(newAssessment);
    setIsAssessmentFlowOpen(false);
    if (currentUser) {
      loadUserData(currentUser.id, newRoleId);
    }
    setCurrentTab('dashboard');
  };

  const handleStartVivaFromProfile = (projectId?: string) => {
    setActiveProjectIdForViva(projectId || null);
    setCurrentTab('dashboard');
  };

  const handleOpenAuth = (mode: 'login' | 'register', role: 'student' | 'placement_officer' | 'recruiter' = 'student') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center text-slate-500 text-xs font-semibold">
        Initializing ProofPath Intelligence Engine...
      </div>
    );
  }

  // If not logged in, render the clean Landing Page with Auth Trigger
  if (!currentUser) {
    return (
      <>
        <LandingPage onOpenAuth={handleOpenAuth} />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          initialRole={authRole}
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const isRecruiter = currentUser.role === 'placement_officer' || currentUser.role === 'recruiter';

  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      targetRole={targetRoleName}
      onStartNewAnalysis={() => setIsAssessmentFlowOpen(true)}
    >
      {/* 3-Step SkillBridge Assessment Modal (Student Only) */}
      {!isRecruiter && isAssessmentFlowOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto">
            <button
              onClick={() => setIsAssessmentFlowOpen(false)}
              className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <span>✕ Close</span>
            </button>
            <SkillBridgeAssessmentFlow
              userId={currentUser.id}
              onAssessmentCompleted={handleAssessmentCompleted}
              onCancel={() => setIsAssessmentFlowOpen(false)}
            />
          </div>
        </div>
      )}

      {/* RECRUITER PORTAL SUITE: Completely isolated recruiter experience */}
      {isRecruiter ? (
        <PlacementPage
          initialTab={
            currentTab === 'cohort' ? 'cohort' :
            currentTab === 'archive' ? 'archive' :
            'analyzer'
          }
          focusUpload={currentTab === 'resume-upload'}
          currentUser={currentUser}
          onNavigate={(tab) => setCurrentTab(tab)}
        />
      ) : (
        /* STUDENT PORTAL SUITE */
        <>
          {/* Recruiter Placement Suite preview if navigated */}
          {currentTab === 'placement' && (
            <PlacementPage
              currentUser={currentUser}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Fallback for legacy navigation */}
          {currentTab === 'skill-analysis' && (
            <Dashboard
              userId={currentUser.id}
              userName={currentUser.full_name}
              currentUser={currentUser}
              targetRoleName={targetRoleName}
              assessment={assessment}
              evidence={evidence}
              sources={sources}
              onNavigate={setCurrentTab}
              onStartNewAnalysis={() => setIsAssessmentFlowOpen(true)}
              onAssessmentUpdated={(updated) => {
                setAssessment(updated);
                loadUserData(currentUser.id, targetRoleId);
              }}
            />
          )}

          {/* Direct Resume Upload & Analysis */}
          {currentTab === 'resume-upload' && (
            <ResumeUploadPage
              userId={currentUser.id}
              userName={currentUser.full_name}
              currentUser={currentUser}
              targetRoleName={targetRoleName}
              targetRoleId={targetRoleId}
              assessment={assessment}
              sources={sources}
              evidence={evidence}
              onRoleChange={handleRoleChange}
              onAssessmentCompleted={handleAssessmentCompleted}
              onNavigateTab={setCurrentTab}
              onRefreshData={() => loadUserData(currentUser.id, targetRoleId)}
            />
          )}

          {/* Dashboard & In-Place Roadmap Targeting Identified Lags */}
          {currentTab === 'dashboard' && (
            <Dashboard
              userId={currentUser.id}
              userName={currentUser.full_name}
              currentUser={currentUser}
              targetRoleName={targetRoleName}
              assessment={assessment}
              evidence={evidence}
              sources={sources}
              onNavigate={setCurrentTab}
              onStartNewAnalysis={() => setIsAssessmentFlowOpen(true)}
              onAssessmentUpdated={(updated) => {
                setAssessment(updated);
                loadUserData(currentUser.id, targetRoleId);
              }}
            />
          )}

          {/* ATS Resume Builder */}
          {currentTab === 'resume-builder' && (
            <InstantResumeBuilderPage
              userId={currentUser.id}
              defaultUserName={currentUser.full_name}
              defaultEmail={currentUser.email}
              targetRoleName={targetRoleName}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* Student Profile */}
          {currentTab === 'profile' && (
            <CareerProfilePage
              userId={currentUser.id}
              currentUser={currentUser}
              targetRoleName={targetRoleName}
              sources={sources}
              evidence={evidence}
              assessment={assessment}
              targetRoleId={targetRoleId}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                if (updated.target_role) setTargetRoleName(updated.target_role);
              }}
              onRefreshData={() => loadUserData(currentUser.id, targetRoleId)}
              onStartViva={handleStartVivaFromProfile}
              onNavigateTab={setCurrentTab}
            />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
