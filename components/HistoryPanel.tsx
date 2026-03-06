'use client';

import { CouncilSession, CouncilMode } from '@/lib/types';

const MODE_BADGE: Record<CouncilMode, { emoji: string; label: string; color: string }> = {
  council: { emoji: '⚔️', label: 'Council', color: '#A78BFA' },
  roundtable: { emoji: '💬', label: 'Roundtable', color: '#60A5FA' },
  debate: { emoji: '🔥', label: 'Debate', color: '#F472B6' },
  dm: { emoji: '🎯', label: '1-on-1', color: '#34D399' },
};

interface Props {
  sessions: CouncilSession[];
  onSelect: (session: CouncilSession) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function HistoryPanel({ sessions, onSelect, onClear, onClose }: Props) {
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto w-full max-w-sm h-full overflow-y-auto" style={{
        backgroundColor: '#0f0f14',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="sticky top-0 p-4 flex items-center justify-between" style={{
          backgroundColor: '#0f0f14',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 className="text-sm font-bold text-gray-200">Past Sessions</h2>
          <div className="flex gap-2">
            {sessions.length > 0 && (
              <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-400/10 transition-colors">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 text-sm">No sessions yet.</p>
            <p className="text-gray-700 text-xs mt-1">Ask The Council a question to get started.</p>
          </div>
        ) : (
          <div className="p-2">
            {sessions.map((session) => {
              const badge = MODE_BADGE[session.mode] || MODE_BADGE.council;
              const turnCount = session.turns?.filter(t => t.role === 'user').length || 0;

              return (
                <button
                  key={session.id}
                  onClick={() => { onSelect(session); onClose(); }}
                  className="w-full text-left p-3 rounded-xl mb-1 transition-all duration-200 hover:bg-white/5"
                  style={{ border: '1px solid transparent' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      backgroundColor: `${badge.color}15`,
                      border: `1px solid ${badge.color}30`,
                      color: badge.color,
                    }}>
                      {badge.emoji} {badge.label}
                    </span>
                    {turnCount > 1 && (
                      <span className="text-xs text-gray-600">{turnCount} turns</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-2 mb-1">{session.question}</p>
                  <span className="text-xs text-gray-600">{formatDate(session.timestamp)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
