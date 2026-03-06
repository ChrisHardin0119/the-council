import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildCouncilPrompt, buildRoundtablePrompt, buildDebatePrompt, buildDMPrompt } from '@/lib/council';
import { CouncilMode, CouncilMemberId, ConversationTurn } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      question,
      mode = 'council',
      participants = ['optimist', 'realist', 'chaos', 'philosopher', 'strategist'],
      previousTurns = [],
      isSwayAttempt = false,
      isContinuation = false,
    } = body as {
      question: string;
      mode: CouncilMode;
      participants: CouncilMemberId[];
      previousTurns: ConversationTurn[];
      isSwayAttempt: boolean;
      isContinuation: boolean;
    };

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (question.length > 500) {
      return NextResponse.json({ error: 'Question too long (max 500 characters)' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Build prompt based on mode
    let prompt: string;
    switch (mode) {
      case 'council':
        prompt = buildCouncilPrompt(question.trim(), participants, previousTurns, isSwayAttempt);
        break;
      case 'roundtable':
        prompt = buildRoundtablePrompt(question.trim(), participants, previousTurns);
        break;
      case 'debate':
        prompt = buildDebatePrompt(question.trim(), participants, previousTurns, isContinuation);
        break;
      case 'dm':
        prompt = buildDMPrompt(question.trim(), participants[0], previousTurns);
        break;
      default:
        prompt = buildCouncilPrompt(question.trim(), participants, previousTurns);
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: prompt },
      ],
    });

    const textBlock = message.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    let parsed;
    try {
      let jsonStr = textBlock.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', textBlock.text);
      return NextResponse.json({ error: 'Failed to parse council response' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Council API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
