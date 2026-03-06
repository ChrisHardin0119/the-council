'use client';

import { useState, useEffect, useCallback } from 'react';
import { CouncilSession, CouncilMode, CouncilMemberId, CouncilResponse, ConversationTurn } from '@/lib/types';
import { COUNCIL_MEMBERS, COUNCIL_ORDER } from '@/lib/council';
import { loadHistory, saveSession, clearHistory, generateId } from '@/lib/storage';
import CouncilMemberCard from '@/components/CouncilMemberCard';
import QuestionInput from '@/components/QuestionInput';
import Ruling from '@/components/Ruling';
import HistoryPanel from '@/components/HistoryPanel';
import ModeSwitcher from '@/components/ModeSwitcher';
import MemberSelector from '@/components/MemberSelector';

const MODE_EMOJI: Record<CouncilMode, string> = {
  council: '⚔️',
  roundtable: '💬',
  debate: '🔥',
  dm: '🎯',
};

const MODE_TAGLINE: Record<CouncilMode, string> = {
  council: '5 minds. 1 verdict.',
  roundtable: 'Open discussion.',
  debate: 'Pick your fighters.',
  dm: 'Private conversation.',
};

export default function Home() {
  const [mode, setMode] = useState<CouncilMode>('council');
  const [participants, setParticipants] = useState<CouncilMemberId[]>([...COUNCIL_ORDER]);
  const [currentSession, setCurrentSession] = useState<CouncilSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<CouncilSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    setHistory(loadHistory().sessions);
  }, []);

  // Staggered reveal animation
  useEffect(() => {
    const lastTurn = currentSession?.turns.filter(t => t.role === 'council').slice(-1)[0];
    const responseCount = lastTurn?.responses?.length || 0;
    if (!currentSession || responseCount === 0) {
      setRevealedCount(0);
      return;
    }
    // +1 for the ruling
    const total = responseCount + (lastTurn?.ruling ? 1 : 0);
    if (revealedCount >= total) return;

    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentSession, revealedCount]);

  // When switching modes, reset participants appropriately
  const handleModeChange = (newMode: CouncilMode) => {
    if (isLoading) return;
    setMode(newMode);
    if (newMode === 'dm') {
      setParticipants([COUNCIL_ORDER[0]]);
    } else if (newMode === 'debate') {
      setParticipants([COUNCIL_ORDER[0], COUNCIL_ORDER[1]]);
    } else {
      setParticipants([...COUNCIL_ORDER]);
    }
    // Reset session when switching modes
    setCurrentSession(null);
    setRevealedCount(0);
    setError(null);
  };

  const handleAskQuestion = useCallback(async (
    question: string,
    opts?: { isSwayAttempt?: boolean; isContinuation?: boolean }
  ) => {
    setIsLoading(true);
    setError(null);
    setRevealedCount(0);

    const isFollowUp = !!currentSession;
    const previousTurns = currentSession?.turns || [];

    try {
      const res = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          mode,
          participants,
          previousTurns,
          isSwayAttempt: opts?.isSwayAttempt || false,
          isContinuation: opts?.isContinuation || false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Build updated session
      const userTurn: ConversationTurn = {
        role: 'user',
        question,
        timestamp: new Date().toISOString(),
      };
      const councilTurn: ConversationTurn = {
        role: 'council',
        responses: data.responses || [],
        ruling: data.ruling || undefined,
        timestamp: new Date().toISOString(),
      };

      if (isFollowUp && currentSession) {
        // Append turns to existing session
        const updated: CouncilSession = {
          ...currentSession,
          turns: [...currentSession.turns, userTurn, councilTurn],
        };
        setCurrentSession(updated);
        saveSession(updated);
      } else {
        // New session
        const session: CouncilSession = {
          id: generateId(),
          mode,
          question,
          turns: [userTurn, councilTurn],
          participants: [...participants],
          timestamp: new Date().toISOString(),
        };
        setCurrentSession(session);
        saveSession(session);
      }

      setHistory(loadHistory().sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consult The Council');
    } finally {
      setIsLoading(false);
    }
  }, [mode, participants, currentSession]);

  const handleSelectHistory = (session: CouncilSession) => {
    setCurrentSession(session);
    setMode(session.mode);
    setParticipants(session.participants);
    // Reveal everything immediately for loaded sessions
    const lastCouncilTurn = session.turns.filter(t => t.role === 'council').slice(-1)[0];
    const count = (lastCouncilTurn?.responses?.length || 0) + (lastCouncilTurn?.ruling ? 1 : 0);
    setRevealedCount(count);
    setError(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleNewQuestion = () => {
    setCurrentSession(null);
    setRevealedCount(0);
    setError(null);
  };

  // Get the latest council turn for display
  const getLatestTurn = () => {
    if (!currentSession) return null;
    return currentSession.turns.filter(t => t.role === 'council').slice(-1)[0] || null;
  };

  const latestTurn = getLatestTurn();
  const showVotes = mode === 'council';
  const showRuling = mode === 'council' || mode === 'debate';
  const rulingLabel = mode === 'debate' ? 'DEBATE STATUS' : 'COUNCIL RULING';

  // Which members to show cards for
  const displayMembers = participants;

  // Determine placeholder text
  const getPlaceholder = () => {
    if (currentSession && !isLoading) {
      if (mode === 'council') return 'Follow up, or try to sway their votes...';
      if (mode === 'debate') return 'Add to the debate, or say "Continue"...';
      if (mode === 'dm') return `Message ${COUNCIL_MEMBERS[participants[0]]?.name}...`;
      return 'Ask a follow-up question...';
    }
    switch (mode) {
      case 'council': return 'Ask The Council for a ruling...';
      case 'roundtable': return 'Start a discussion topic...';
      case 'debate': return 'Give them a topic to debate...';
      case 'dm': return `Ask ${COUNCIL_MEMBERS[participants[0]]?.name} something...`;
      default: return 'Ask The Council anything...';
    }
  };

  const getStatusText = () => {
    if (isLoading) {
      switch (mode) {
        case 'council': return '✨ The Council is deliberating...';
        case 'roundtable': return '💬 The table is discussing...';
        case 'debate': return '🔥 The debate rages on...';
        case 'dm': return `🎯 ${COUNCIL_MEMBERS[participants[0]]?.name} is thinking...`;
      }
    }
    if (currentSession) return 'Press Enter to continue the conversation';
    return 'Press Enter to begin';
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between" style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={handleNewQuestion} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">{MODE_EMOJI[mode]}</span>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-gray-100">THE COUNCIL</h1>
            <p className="text-xs text-gray-500 -mt-0.5">{MODE_TAGLINE[mode]}</p>
          </div>
        </button>
        <button onClick={() => setShowHistory(true)} className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-gray-400">
            <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
          </svg>
          {history.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
              style={{ backgroundColor: '#7C3AED', color: 'white', fontSize: '9px' }}>
              {history.length > 9 ? '9+' : history.length}
            </span>
          )}
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Mode switcher — always visible */}
        <div className="mb-4">
          <ModeSwitcher mode={mode} onChange={handleModeChange} disabled={isLoading} />
        </div>

        {/* Member selector — visible when no active session or starting fresh */}
        {!isLoading && (
          <div className="mb-4">
            <MemberSelector
              selected={participants}
              onChange={setParticipants}
              mode={mode}
              disabled={isLoading || !!currentSession}
            />
          </div>
        )}

        {/* Welcome state */}
        {!currentSession && !isLoading && (
          <div className="text-center py-8 mb-4">
            <div className="text-5xl mb-4">{MODE_EMOJI[mode]}</div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">
              {mode === 'council' && 'Convene The Council'}
              {mode === 'roundtable' && 'Start a Roundtable'}
              {mode === 'debate' && 'Ignite a Debate'}
              {mode === 'dm' && `Chat with ${COUNCIL_MEMBERS[participants[0]]?.name}`}
            </h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {mode === 'council' && 'Ask any question. Your advisors will deliberate and deliver their verdict.'}
              {mode === 'roundtable' && 'Bring a topic. Everyone shares perspectives — no voting, just vibes.'}
              {mode === 'debate' && 'Pick your fighters and give them something to argue about.'}
              {mode === 'dm' && `Have a private conversation with ${COUNCIL_MEMBERS[participants[0]]?.name}.`}
            </p>
          </div>
        )}

        {/* Conversation history */}
        {currentSession && currentSession.turns.map((turn, turnIdx) => {
          if (turn.role === 'user') {
            return (
              <div key={`user-${turnIdx}`} className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">🙋</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">You asked</p>
                  <p className="text-sm text-gray-100">{turn.question}</p>
                </div>
              </div>
            );
          }

          // Council turn
          const isLatest = turnIdx === currentSession.turns.length - 1;
          const responses = turn.responses || [];

          return (
            <div key={`council-${turnIdx}`} className="mb-6">
              <div className="space-y-3">
                {responses.map((resp, respIdx) => {
                  const member = COUNCIL_MEMBERS[resp.memberId];
                  if (!member) return null;

                  // Staggered reveal only for the latest turn
                  const isRevealed = !isLatest || respIdx < revealedCount;
                  if (!isRevealed && !isLoading) return null;

                  return (
                    <div key={`${resp.memberId}-${turnIdx}`} className="transition-all duration-500" style={{
                      opacity: isRevealed ? 1 : 0.5,
                      transform: isRevealed ? 'translateY(0)' : 'translateY(8px)',
                    }}>
                      <CouncilMemberCard
                        member={member}
                        response={isRevealed ? resp : undefined}
                        isLoading={isLoading && !isRevealed}
                        showVote={showVotes}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Ruling / Debate Status */}
              {showRuling && turn.ruling && (!isLatest || revealedCount > responses.length) && (
                <div className="mt-4">
                  <Ruling
                    ruling={turn.ruling}
                    responses={responses}
                    showVotes={showVotes}
                    label={rulingLabel}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading state for initial question */}
        {isLoading && !currentSession && (
          <div className="mb-6">
            <div className="space-y-3">
              {displayMembers.map((id) => {
                const member = COUNCIL_MEMBERS[id];
                return (
                  <div key={id} className="transition-all duration-500" style={{ opacity: 0.5 }}>
                    <CouncilMemberCard member={member} isLoading={true} showVote={showVotes} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons after response */}
        {currentSession && !isLoading && latestTurn && revealedCount >= (latestTurn.responses?.length || 0) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {mode === 'debate' && (
              <button
                onClick={() => handleAskQuestion('Continue the debate — go deeper!', { isContinuation: true })}
                className="text-xs px-4 py-2 rounded-xl transition-all duration-200"
                style={{
                  background: 'rgba(244, 114, 182, 0.1)',
                  border: '1px solid rgba(244, 114, 182, 0.3)',
                  color: '#F472B6',
                }}
              >
                🔥 Continue Debate
              </button>
            )}
            <button onClick={handleNewQuestion}
              className="text-xs text-purple-400 hover:text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-400/10 transition-colors">
              ← New {mode === 'dm' ? 'Chat' : 'Topic'}
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-red-300" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 px-4 pb-4 pt-2" style={{
        background: 'linear-gradient(to top, #0a0a10 80%, transparent)',
      }}>
        <div className="max-w-2xl mx-auto">
          {/* Sway votes hint in council mode */}
          {mode === 'council' && currentSession && !isLoading && (
            <div className="flex justify-center mb-2">
              <button
                onClick={() => {
                  const input = document.querySelector('textarea');
                  if (input) input.focus();
                }}
                className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                style={{
                  background: 'rgba(167, 139, 250, 0.1)',
                  border: '1px solid rgba(167, 139, 250, 0.2)',
                  color: '#A78BFA',
                }}
              >
                💡 Type an argument to sway their votes
              </button>
            </div>
          )}
          <QuestionInput
            onSubmit={(q) => {
              if (mode === 'council' && currentSession) {
                handleAskQuestion(q, { isSwayAttempt: true });
              } else if (mode === 'debate' && currentSession) {
                handleAskQuestion(q, { isContinuation: true });
              } else {
                handleAskQuestion(q);
              }
            }}
            isLoading={isLoading}
            placeholder={getPlaceholder()}
            statusText={getStatusText()}
          />
        </div>
      </div>

      {showHistory && (
        <HistoryPanel
          sessions={history}
          onSelect={handleSelectHistory}
          onClear={handleClearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </main>
  );
}
