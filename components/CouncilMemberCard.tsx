'use client';

import { CouncilMember, CouncilResponse } from '@/lib/types';

interface Props {
  member: CouncilMember;
  response?: CouncilResponse;
  isLoading?: boolean;
  delay?: number;
}

export default function CouncilMemberCard({ member, response, isLoading, delay = 0 }: Props) {
  const hasResponse = !!response;

  const voteLabel = response?.vote === 'for' ? '👍 For' : response?.vote === 'against' ? '👎 Against' : response?.vote === 'abstain' ? '🤷 Abstain' : '';
  const voteColor = response?.vote === 'for' ? '#34D399' : response?.vote === 'against' ? '#F87171' : '#94A3B8';

  return (
    <div
      className="rounded-xl p-4 transition-all duration-500 relative overflow-hidden"
      style={{
        backgroundColor: hasResponse ? member.bgColor : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hasResponse ? member.borderColor : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hasResponse ? `0 0 20px ${member.glowColor}` : 'none',
        opacity: isLoading ? 0.6 : 1,
        animationDelay: `${delay}ms`,
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
        {response?.vote && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            color: voteColor,
            backgroundColor: `${voteColor}15`,
            border: `1px solid ${voteColor}30`,
          }}>
            {voteLabel}
          </span>
        )}
      </div>

      {/* Response */}
      {isLoading && (
        <div className="flex gap-1.5 py-2">
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: member.color, animationDelay: '300ms' }} />
        </div>
      )}
      {hasResponse && !isLoading && (
        <p className="text-sm leading-relaxed text-gray-200">
          {response.response}
        </p>
      )}
      {!hasResponse && !isLoading && (
        <p className="text-xs text-gray-600 italic">{member.description}</p>
      )}
    </div>
  );
}
