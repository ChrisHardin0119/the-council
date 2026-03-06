'use client';

import { CouncilResponse } from '@/lib/types';

interface Props {
  ruling: string;
  responses: CouncilResponse[];
}

export default function Ruling({ ruling, responses }: Props) {
  const forCount = responses.filter(r => r.vote === 'for').length;
  const againstCount = responses.filter(r => r.vote === 'against').length;
  const abstainCount = responses.filter(r => r.vote === 'abstain').length;

  return (
    <div className="rounded-xl p-5 text-center relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(124, 58, 237, 0.05))',
      border: '1px solid rgba(167, 139, 250, 0.25)',
      boxShadow: '0 0 40px rgba(167, 139, 250, 0.1)',
    }}>
      {/* Vote tally */}
      <div className="flex justify-center gap-6 mb-3">
        <span className="text-xs" style={{ color: '#34D399' }}>👍 {forCount} For</span>
        <span className="text-xs" style={{ color: '#F87171' }}>👎 {againstCount} Against</span>
        <span className="text-xs" style={{ color: '#94A3B8' }}>🤷 {abstainCount} Abstain</span>
      </div>

      {/* Ruling text */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">Council Ruling</span>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{ruling}</p>
    </div>
  );
}
