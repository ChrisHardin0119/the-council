'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  placeholder?: string;
  statusText?: string;
}

export default function QuestionInput({ onSubmit, isLoading, placeholder = 'Ask The Council anything...', statusText }: Props) {
  const [question, setQuestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSubmit(question.trim());
    setQuestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative rounded-2xl overflow-hidden" style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 30px rgba(167, 139, 250, 0.05)',
      }}>
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, 500))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 px-5 py-4 pr-14 resize-none focus:outline-none text-sm"
          style={{ minHeight: '52px' }}
        />
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: question.trim() && !isLoading ? 'linear-gradient(135deg, #A78BFA, #7C3AED)' : 'rgba(255,255,255,0.05)',
            cursor: question.trim() && !isLoading ? 'pointer' : 'default',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={question.trim() && !isLoading ? 'text-white' : 'text-gray-600'}>
            <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-gray-600">
          {statusText || (isLoading ? '✨ The Council is deliberating...' : 'Press Enter to convene The Council')}
        </span>
        <span className="text-xs text-gray-600">{question.length}/500</span>
      </div>
    </form>
  );
}
