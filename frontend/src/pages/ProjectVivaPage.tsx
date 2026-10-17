import React, { useState, useEffect } from 'react';
import { VivaSession, VivaQuestion } from '../types';
import { MessageSquareCode, Send, CheckCircle2, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  userId: string;
  projectId?: string;
  onVivaCompleted?: (score: number) => void;
}

export const ProjectVivaPage: React.FC<Props> = ({ userId, projectId, onVivaCompleted }) => {
  const [session, setSession] = useState<VivaSession | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.startVivaSession(userId, projectId).then(setSession).catch(console.error);
  }, [userId, projectId]);

  if (!session) {
    return (
      <div className="h-64 rounded-2xl bg-[#141721] border border-[#222634] flex items-center justify-center text-slate-400">
        Initializing Technical Viva Defense Session...
      </div>
    );
  }

  const currentQ: VivaQuestion | undefined = session.questions[currentQIndex];
  const currentEval = session.evaluations[currentQIndex];

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim() || !currentQ) return;
    setSubmitting(true);
    try {
      const updated = await api.submitVivaAnswer(session.id, currentQ.id, answerInput);
      setSession(updated);
      setAnswerInput('');
      if (updated.overall_viva_score && onVivaCompleted) {
        onVivaCompleted(updated.overall_viva_score);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white">Technical Viva Defense: {session.project_name}</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Interactive viva testing your design trade-offs, preprocessing integrity, and engineering reasoning directly against your analyzed codebase.
          </p>
        </div>

        {session.overall_viva_score ? (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Viva Defense Score: {session.overall_viva_score}%</span>
          </div>
        ) : (
          <div className="text-xs text-indigo-400 font-medium px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 shrink-0">
            Question {currentQIndex + 1} of {session.questions.length}
          </div>
        )}
      </div>

      {/* Viva Question & Answer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Question Card & Code Reference */}
        <div className="lg:col-span-2 space-y-4">
          {currentQ ? (
            <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] space-y-4">
              <div className="flex items-center justify-between border-b border-[#222634] pb-3">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Focus: {currentQ.focus_area}
                </span>
                {currentQ.code_reference && (
                  <span className="text-[11px] font-mono text-slate-400 bg-[#1e2230] px-2.5 py-1 rounded-md">
                    Ref: {currentQ.code_reference}
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                "{currentQ.question}"
              </p>

              <div className="p-3.5 rounded-xl bg-[#181c28] border border-[#262c3e] text-xs text-slate-300 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Evaluation Rubric Expectation:
                </span>
                <p>{currentQ.expected_demonstration}</p>
              </div>

              {/* Input Area if not evaluated yet */}
              {!currentEval ? (
                <div className="space-y-3 pt-2">
                  <textarea
                    rows={4}
                    placeholder="Explain your architectural reasoning, algorithm trade-offs, and implementation approach..."
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#0c0e14] border border-[#262c3e] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Evaluated on technical reasoning and consistency with code. Not judged on English fluency or grammar.
                    </span>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answerInput.trim()}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all shrink-0"
                    >
                      <span>{submitting ? 'Evaluating...' : 'Submit Defense Answer'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Evaluated Feedback Card */
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-400">
                      Answer Evaluated: {currentEval.score}% Technical Soundness
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {currentEval.conceptual_soundness}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentEval.feedback}
                  </p>
                  {currentQIndex < session.questions.length - 1 && (
                    <button
                      onClick={() => setCurrentQIndex(prev => prev + 1)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all mt-2"
                    >
                      <span>Next Viva Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#141721] border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Project Viva Defense Completed!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {session.summary_findings}
              </p>
            </div>
          )}
        </div>

        {/* Right: Question Navigation & Progress */}
        <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634]">
            Viva Defense Questions
          </h3>

          <div className="space-y-2">
            {session.questions.map((q, idx) => {
              const isAnswered = Boolean(session.evaluations[idx]);
              const isActive = currentQIndex === idx;

              return (
                <div
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : isAnswered
                        ? 'bg-[#181c28] border-emerald-500/30 text-slate-200'
                        : 'bg-[#181c28] border-[#222634] text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Q{idx + 1}: {q.focus_area}</span>
                    {isAnswered && <span className="text-emerald-400 font-bold">{session.evaluations[idx].score}%</span>}
                  </div>
                  <p className="line-clamp-2 text-[11px] text-slate-400">{q.question}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
