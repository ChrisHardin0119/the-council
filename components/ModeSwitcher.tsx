'use client';

import { CouncilMode } from '@/lib/types';

const MODES: { id: CouncilMode; label: string; emoji: string; desc: string }[] = [
  { id: 'council', label: 'Council', emoji: '⚔️', desc: 'Vote & Rule' },
  { id: 'roundtable', label: 'Roundtable', emoji: '💬', desc: 'Just Talk' },
  { id: 'debate', label: 'Debate', emoji: '🔥', desc: 'Pick Sides' },
  { id: 'dm', label: '1-on-1', emoji: '🎯', desc: 'Private Chat' },
];

interface Props {
  mode: CouncilMode;
  onChange: (mode: CouncilMode) => void;
  disabled?: boolean;
}

export default function ModeSwitcher({ mode, onChange, disabled }: Props) {
  return (
    <div className="flex gap-1.5 p-1 rounded-2xl" style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {MODES.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => !disabled && onChange(m.id)}
            disabled={disabled}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all duration-200"
            style={{
              background: isActive ? 'rgba(167, 139, 250, 0.15)' : 'transparent',
              border: isActive ? '1px solid rgba(167, 139, 250, 0.3)' : '1px solid transparent',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            <span className="text-base">{m.emoji}</span>
            <span className="text-xs font-medium" style={{
              color: isActive ? '#A78BFA' : '#6B7280',
            }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
