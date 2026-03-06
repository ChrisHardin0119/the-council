// Council member identities
export type CouncilMemberId = 'optimist' | 'realist' | 'chaos' | 'philosopher' | 'strategist';

// Modes: council (vote+ruling), roundtable (discussion), debate (pick members to argue), dm (1-on-1)
export type CouncilMode = 'council' | 'roundtable' | 'debate' | 'dm';

export interface CouncilMember {
  id: CouncilMemberId;
  name: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  description: string;
  personality: string;
}

export interface CouncilResponse {
  memberId: CouncilMemberId;
  response: string;
  vote?: 'for' | 'against';  // only in council mode
}

export interface ConversationTurn {
  role: 'user' | 'council';
  question?: string;
  responses?: CouncilResponse[];
  ruling?: string;
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  mode: CouncilMode;
  question: string;               // initial question
  turns: ConversationTurn[];      // full conversation history
  participants: CouncilMemberId[]; // who's involved
  timestamp: string;
}

export interface CouncilHistory {
  sessions: CouncilSession[];
}
