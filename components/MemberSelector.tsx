'use client';

import { CouncilMemberId, CouncilMode } from '@/lib/types';
import { COUNCIL_MEMBERS, COUNCIL_ORDER } from '@/lib/council';

interface Props {
  selected: CouncilMemberId[];
  onChange: (selected: CouncilMemberId[]) => void;
  mode: CouncilMode;
  disabled?: boolean;
}

export default function MemberSelector({ selected, onChange, mode, disabled }: Props) {
  const minRequired = mode === 'dm' ? 1 : mode === 'debate' ? 2 : 1;
  const maxAllowed = mode === 'dm' ? 1 : 5;
  const isDM = mode === 'dm';

  const toggle = (id: CouncilMemberId) => {
    if (disabled) return;

    if (isDM) {
      // DM mode: only one at a time
      onChange([id]);
      return;
    }

    if (selected.includes(id)) {
      // Don't go below minimum
      if (selected.length <= minRequired) return;
      onChange(selected.filter(s => s !== id));
    } else {
      if (selected.length >= maxAllowed) return;
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {isDM ? 'Choose your advisor' :
           mode === 'debate' ? 'Pick debaters (2+)' :
           'Choose who participates'}
        </span>
        {!isDM && (
          <button
            onClick={() => !disabled && onChange([...COUNCIL_ORDER])}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            Select All
          </button>
        )}
      </div>
      <div className="flex gap-2 justify-center">
        {COUNCIL_ORDER.map((id) => {
          const m = COUNCIL_MEMBERS[id];
          const isSelected = selected.includes(id);
          const isDisabledMember = disabled || false;

          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              disabled={isDisabledMember}
              className="flex flex-col items-center gap-1 transition-all duration-200"
              style={{
                opacity: isSelected ? 1 : 0.3,
                transform: isSelected ? 'scale(1)' : 'scale(0.9)',
                cursor: isDisabledMember ? 'default' : 'pointer',
                filter: isSelected ? 'none' : 'grayscale(100%)',
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? m.bgColor : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSelected ? m.color : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: isSelected ? `0 0 12px ${m.glowColor}` : 'none',
                }}
              >
                {m.emoji}
              </div>
              <span className="text-xs" style={{
                color: isSelected ? m.color : '#4B5563',
              }}>{m.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
