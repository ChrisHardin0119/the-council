'use client';

import { useState, useEffect, useCallback } from 'react';
import { CouncilSession } from '@/lib/types';
import { COUNCIL_MEMBERS, COUNCIL_ORDER } from '@/lib/council';
import { loadHistory, saveSession, clearHistory, generateId } from '@/lib/storage';
import CouncilMemberCard from '@/components/CouncilMemberCard';
import QuestionInput from '@/components/QuestionInput';
import Ruling from '@/components/Ruling';
import HistoryPanel from '@/components/HistoryPanel';

export default function Home() {
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
    if (!currentSession || currentSession.responses.length === 0) {
      setRevealedCount(0);
      return;
    }
    if (revealedCount >= currentSession.responses.length + 1) return;

    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentSession, revealedCount]);

  const handleAskQuestion = useCallback(async (question: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSession(null);
    setRevealedCount(0);

    try {
      const res = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const session: CouncilSession = {
        id: generateId(),
        question,
        responses: data.responses || [],
        ruling: data.ruling || '',
        timestamp: new Date().toISOString(),
      };

      setCurrentSession(session);
      saveSession(session);
      setHistory(loadHistory().sessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to consult The Council');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectHistory = (session: CouncilSession) => {
    setCurrentSession(session);
    setRevealedCount(session.responses.length + 1);
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

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between" style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button onClick={handleNewQuestion} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl">⚔️</span>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-gray-100">THE COUNCIL</h1>
            <p className="text-xs text-gray-500 -mt-0.5">5 minds. 1 question.</p>
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
        {/* Welcome state */}
        {!currentSession && !isLoading && (
          <div className="text-center py-12 mb-6">
            <div className="text-5xl mb-4">⚔️</div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Convene The Council</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">
              Ask any question. Five advisors with wildly different perspectives will deliberate and deliver their verdict.
            </p>
            <div className="flex justify-center gap-3 mb-2">
              {COUNCIL_ORDER.map((id) => {
                const m = COUNCIL_MEMBERS[id];
                return (
                  <div key={id} className="flex flex-col items-center gap-1">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: m.bgColor, border: `1px solid ${m.borderColor}` }}>
                      {m.emoji}
                    </div>
                    <span className="text-xs text-gray-500">{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active session */}
        {(currentSession || isLoading) && (
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">🙋</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">You asked</p>
                <p className="text-sm text-gray-100">{currentSession?.question || 'Loading...'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {COUNCIL_ORDER.map((id, index) => {
                const member = COUNCIL_MEMBERS[id];
                const response = currentSession?.responses.find(r => r.memberId === id);
                const isRevealed = index < revealedCount;

                if (!isRevealed && !isLoading) return null;

                return (
                  <div key={id} className="transition-all duration-500" style={{
                    opacity: isRevealed ? 1 : 0.5,
                    transform: isRevealed ? 'translateY(0)' : 'translateY(8px)',
                  }}>
                    <CouncilMemberCard
                      member={member}
                      response={isRevealed ? response : undefined}
                      isLoading={isLoading && !isRevealed}
                    />
                  </div>
                );
              })}
            </div>

            {currentSession?.ruling && revealedCount > currentSession.responses.length && (
              <div className="mt-4">
                <Ruling ruling={currentSession.ruling} responses={currentSession.responses} />
              </div>
            )}

            {currentSession && !isLoading && revealedCount > (currentSession?.responses.length || 0) && (
              <div className="mt-6 text-center">
                <button onClick={handleNewQuestion}
                  className="text-xs text-purple-400 hover:text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-400/10 transition-colors">
                  ← Ask another question
                </button>
              </div>
            )}
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
          <QuestionInput onSubmit={handleAskQuestion} isLoading={isLoading} />
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
