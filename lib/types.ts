// Council member identities
export type CouncilMemberId = 'optimist' | 'realist' | 'chaos' | 'philosopher' | 'strategist';

export interface CouncilMember {
  id: CouncilMemberId;
  name: string;
  title: string;
  emoji: string;
  color: string;        // primary accent color
  bgColor: string;      // card background tint
  borderColor: string;  // card border
  glowColor: string;    // glow effect
  description: string;
  personality: string;   // system prompt personality description
}

export interface CouncilResponse {
  memberId: CouncilMemberId;
  response: string;
  vote?: 'for' | 'against' | 'abstain';
}

export interface CouncilSession {
  id: string;
  question: string;
  responses: CouncilResponse[];
  timestamp: string;
  ruling?: string;  // AI-generated summary of the council's ruling
}

export interface CouncilHistory {
  sessions: CouncilSession[];
}
