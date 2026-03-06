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
  const isDM = mode === 'dm';
  const isDebate = mode === 'debate';

  const toggle = (id: CouncilMemberId) => {
    if (disabled) return;

    if (isDM) {
      onChange([id]);
      return;
    }

    if (isDebate) {
      // In debate mode, clicking adds another copy (allows duplicates!)
      // Clicking an already-selected one removes the LAST instance
      const lastIndex = selected.lastIndexOf(id);
      if (lastIndex >= 0 && selected.length > 2) {
        // Remove last instance of this member
        const newArr = [...selected];
        newArr.splice(lastIndex, 1);
        onChange(newArr);
      } else if (lastIndex < 0) {
        // Add them
        onChange([...selected, id]);
      }
      // If they're selected and we only have 2, don't remove (min 2)
      return;
    }

    // Normal toggle for council/roundtable
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      onChange(selected.filter(s => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const addDuplicate = (id: CouncilMemberId) => {
    if (disabled) return;
    onChange([...selected, id]);
  };

  // Count how many times each member appears (for debate mode)
  const countOf = (id: CouncilMemberId) => selected.filter(s => s === id).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {isDM ? 'Choose your advisor' :
           isDebate ? 'Pick debaters (tap to add, duplicates allowed!)' :
           'Choose who participates'}
        </span>
        {!isDM && !isDebate && (
          <button
            onClick={() => !disabled && onChange([...COUNCIL_ORDER])}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            Select All
          </button>
        )}
        {isDebate && selected.length > 2 && (
          <button
            onClick={() => !disabled && onChange([selected[0], selected[1]])}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex gap-2 justify-center flex-wrap">
        {COUNCIL_ORDER.map((id) => {
          const m = COUNCIL_MEMBERS[id];
          const count = countOf(id);
          const isSelected = count > 0;
          const isDisabledMember = disabled || false;

          return (
            <button
              key={id}
              onClick={() => isDebate && isSelected ? addDuplicate(id) : toggle(id)}
              onContextMenu={(e) => {
                // Right-click to remove in debate mode
                if (isDebate && count > 0 && selected.length > 2) {
                  e.preventDefault();
                  const newArr = [...selected];
                  const lastIdx = newArr.lastIndexOf(id);
                  newArr.splice(lastIdx, 1);
                  onChange(newArr);
                }
              }}
              disabled={isDisabledMember}
              className="flex flex-col items-center gap-1 transition-all duration-200 relative"
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
              {/* Duplicate count badge for debate mode */}
              {isDebate && count > 1 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: m.color,
                    color: '#0a0a10',
                    fontSize: '10px',
                    boxShadow: `0 0 8px ${m.glowColor}`,
                  }}>
                  x{count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Show the matchup in debate mode */}
      {isDebate && selected.length >= 2 && (
        <p className="text-center text-xs text-gray-500 mt-2">
          {selected.map((id, i) => {
            const m = COUNCIL_MEMBERS[id];
            return (
              <span key={`${id}-${i}`}>
                {i > 0 && <span className="text-gray-600"> vs </span>}
                <span style={{ color: m.color }}>{m.name}</span>
              </span>
            );
          })}
        </p>
      )}
    </div>
  );
}
