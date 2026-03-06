import { CouncilSession, CouncilHistory } from './types';

const HISTORY_KEY = 'council-history';
const MAX_SESSIONS = 50;

export function loadHistory(): CouncilHistory {
  if (typeof window === 'undefined') return { sessions: [] };
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { sessions: [] };
}

export function saveSession(session: CouncilSession): void {
  if (typeof window === 'undefined') return;
  const history = loadHistory();
  history.sessions.unshift(session); // newest first
  if (history.sessions.length > MAX_SESSIONS) {
    history.sessions = history.sessions.slice(0, MAX_SESSIONS);
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
