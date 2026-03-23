export type AIProvider = 'runanywhere';

export interface AIResponse {
  content: string;
  reasoning?: string;
}

export interface SummaryResponse {
  summary: string;
  keyPoints: string[];
  terms: string[];
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ChatMode = 'exam' | 'beginner' | 'concise';

export type ExamMarkType = '2' | '5' | '10';
