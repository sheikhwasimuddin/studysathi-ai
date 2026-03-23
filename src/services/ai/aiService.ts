import { config } from '../../lib/config';
import { runAnywhereProvider } from './providers/runAnywhereProvider';
import { webLlmProvider } from './providers/webLlmProvider';
import { USER_PROMPTS, SYSTEM_PROMPTS } from './prompts';
import type { ChatMessage, ExamMarkType } from './types';

/**
 * Unified AIService for strict offline local inference.
 */
export const aiService = {
  async callAI(messages: ChatMessage[], _task: string, options: any = {}) {
    try {
      if (config.strictOffline && (navigator as any).gpu) {
         try {
           return await webLlmProvider.chat(messages, options);
         } catch (e) {
           console.warn('WebGPU fallback to local string mock:', e);
         }
      }
      
      config.provider = 'runanywhere';
      return await runAnywhereProvider.chat(messages, options);
    } catch (error) {
      console.error('AI Service Error (runanywhere):', error);
      throw error;
    }
  },

  async summarize(notes: string, options: any = {}) {
    return await this.callAI([
      { role: 'system', content: SYSTEM_PROMPTS.general },
      { role: 'user', content: USER_PROMPTS.summarize(notes) }
    ], 'summarize', options);
  },

  async generateAnswer(notes: string, question: string, markType: ExamMarkType, options: any = {}) {
    return await this.callAI([
      { role: 'system', content: SYSTEM_PROMPTS.general },
      { role: 'user', content: USER_PROMPTS.generateAnswer(notes, question, markType) }
    ], 'generateAnswer', options);
  },

  async generateQuiz(notes: string, options: any = {}) {
    return await this.callAI([
      { role: 'system', content: SYSTEM_PROMPTS.general },
      { role: 'user', content: USER_PROMPTS.generateQuiz(notes) }
    ], 'generateQuiz', options);
  },

  async generateFlashcards(notes: string, options: any = {}) {
    return await this.callAI([
      { role: 'system', content: SYSTEM_PROMPTS.general },
      { role: 'user', content: USER_PROMPTS.generateFlashcards(notes) }
    ], 'generateFlashcards', options);
  },

  async chat(notes: string, history: ChatMessage[], mode: string = 'exam', options: any = {}) {
    const systemPrompt = mode === 'beginner' ? SYSTEM_PROMPTS.beginner : SYSTEM_PROMPTS.general;
    const notesContext = notes?.trim()
      ? `\n\nStudy Notes Context:\n${notes}`
      : '\n\nStudy Notes Context:\nNo notes provided.';
    const messages = [
      { role: 'system', content: `${systemPrompt}${notesContext}` },
      ...history
    ];

    return await this.callAI(messages as ChatMessage[], 'chat', { ...options, mode });
  }
};
