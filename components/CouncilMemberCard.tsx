'use client';

import { useState } from 'react';
import { CouncilMember, CouncilResponse } from '@/lib/types';

interface Props {
  member: CouncilMember;
  response?: CouncilResponse;
  isLoading?: boolean;
  showVote?: boolean;
  responseKey?: string; // unique key for tracking votes across duplicate members
}

export default function CouncilMemberCard({ member, response, isLoading, showVote = true, responseKey }: Props) {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const hasResponse = !!response;
  const voteLabel = response?.vote === 'for' ? '👍 For' : response?.vote === 'against' ? '👎 Against' : '';
  const voteColor = response?.vote === 'for' ? '#34D399' : response?.vote === 'against' ? '#F87171' : '#94A3B8';

  const handleVote = (vote: 'up' | 'down') => {
    setUserVote(prev => prev === vote ? null : vote);
  };

  return (
    <div
      className="rounded-xl p-4 transition-all duration-500 relative overflow-hidden"
      style={{
        backgroundColor: hasResponse ? member.bgColor : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hasResponse ? member.borderColor : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hasResponse ? `0 0 20px ${member.glowColor}` : 'none',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{member.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: member.color }}>{member.name}</span>
            <span className="text-xs opacity-50 text-gray-400">{member.title}</span>
          </div>
        </div>
        {showVote && response?.vote && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            color: voteColor,
            backgroundColor: `${voteColor}15`,
            border: `1px solid ${voteColor}30`,
          }}>
            {voteLabel}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex gap-1.5 py-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '300ms' }} />
        </div>
      )}
      {hasResponse && !isLoading && (
        <>
          <p className="text-sm leading-relaxed text-gray-200">
            {response.response}
          </p>
          {/* Upvote / Downvote */}
          <div className="flex items-center gap-1 mt-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => handleVote('up')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200"
              style={{
                background: userVote === 'up' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                border: userVote === 'up' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid transparent',
              }}
              title="Good take"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={userVote === 'up' ? '#34D399' : 'none'} stroke={userVote === 'up' ? '#34D399' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              {userVote === 'up' && <span className="text-xs" style={{ color: '#34D399' }}>Nice</span>}
            </button>
            <button
              onClick={() => handleVote('down')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200"
              style={{
                background: userVote === 'down' ? 'rgba(248, 113, 113, 0.15)' : 'transparent',
                border: userVote === 'down' ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid transparent',
              }}
              title="Bad take"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={userVote === 'down' ? '#F87171' : 'none'} stroke={userVote === 'down' ? '#F87171' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
              </svg>
              {userVote === 'down' && <span className="text-xs" style={{ color: '#F87171' }}>Nah</span>}
            </button>
          </div>
        </>
      )}
      {!hasResponse && !isLoading && (
        <p className="text-xs text-gray-600 italic">{member.description}</p>
      )}
    </div>
  );
}
