'use client';

import { useState } from 'react';
import { CouncilResponse } from '@/lib/types';

interface Props {
  ruling: string;
  responses: CouncilResponse[];
  showVotes?: boolean;
  label?: string;
}

export default function Ruling({ ruling, responses, showVotes = true, label = 'COUNCIL RULING' }: Props) {
  const [copied, setCopied] = useState(false);
  const forCount = responses.filter(r => r.vote === 'for').length;
  const againstCount = responses.filter(r => r.vote === 'against').length;

  const handleShare = async () => {
    const text = `⚔️ The Council has spoken:\n\n"${ruling}"\n\n👍 ${forCount} For | 👎 ${againstCount} Against\n\n— the-council.vercel.app`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl p-5 text-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(124, 58, 237, 0.05))',
      border: '1px solid rgba(167, 139, 250, 0.25)',
      boxShadow: '0 0 40px rgba(167, 139, 250, 0.1)',
    }}>
      {/* Vote tally */}
      {showVotes && (forCount > 0 || againstCount > 0) && (
        <div className="flex justify-center gap-6 mb-3">
          <span className="text-xs" style={{ color: '#34D399' }}>👍 {forCount} For</span>
          <span className="text-xs" style={{ color: '#F87171' }}>👎 {againstCount} Against</span>
        </div>
      )}

      {/* Label */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">{label}</span>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed mb-3">{ruling}</p>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
        style={{
          background: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${copied ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.1)'}`,
          color: copied ? '#34D399' : '#9CA3AF',
        }}
      >
        {copied ? '✓ Copied!' : '📋 Share Ruling'}
      </button>
    </div>
  );
}
