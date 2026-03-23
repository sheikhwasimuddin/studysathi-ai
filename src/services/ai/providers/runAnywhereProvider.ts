import type { ChatMessage } from '../types';
import { runAnywhereChat, runAnywhereSpeak, runAnywhereTranscribe } from './runAnywhereSdk';

/**
 * Local offline provider.
 * This implementation performs deterministic, browser-only generation from notes.
 * It does not use network calls.
 */
export const runAnywhereProvider = {
  async chat(messages: ChatMessage[], options: any = {}) {
    const sdkResponse = await runAnywhereChat(messages, options);
    if (sdkResponse?.content) {
      await streamIfRequested(sdkResponse.content, options);
      return sdkResponse;
    }

    const userMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const task = detectTask(userMessage);

    let content = '';

    if (task === 'summarize') {
      const notes = extractBlock(userMessage, 'Notes:') || userMessage;
      const summary = buildSummary(notes, 130);
      const points = buildKeyPoints(notes, 6);
      const terms = buildTerms(notes, 10);
      content = `${summary}\n\n${points.map((p) => `- ${p}`).join('\n')}\n\n${terms.join(', ')}`;
    } else if (task === 'answer') {
      const notes = extractBlock(userMessage, 'Study Material:') || userMessage;
      const question = extractQuotedQuestion(userMessage) || 'Answer based on the provided notes';
      const markType = extractMarkType(userMessage);
      content = buildExamAnswer(notes, question, markType);
    } else if (task === 'quiz') {
      const notes = extractBlock(userMessage, 'Notes:') || userMessage;
      content = JSON.stringify(buildQuiz(notes, 10), null, 2);
    } else if (task === 'flashcards') {
      const notes = extractBlock(userMessage, 'Notes:') || userMessage;
      content = JSON.stringify(buildFlashcards(notes, 10), null, 2);
    } else {
      const notes = extractContextNotes(messages);
      content = buildChatReply(notes, userMessage, options.mode || 'exam');
    }

    await streamIfRequested(content, options);
    return { content };
  },

  async transcribe(_audioBlob: Blob) {
    const transcription = await runAnywhereTranscribe(_audioBlob);
    if (transcription) return transcription;
    return 'Local transcription is available when a browser STT engine is connected.';
  },

  async speak(text: string) {
    await runAnywhereSpeak(text);
  }
};

function detectTask(prompt: string): 'summarize' | 'answer' | 'quiz' | 'flashcards' | 'chat' {
  const p = prompt.toLowerCase();
  if (p.includes('summarize the following study notes')) return 'summarize';
  if (p.includes('-mark exam answer')) return 'answer';
  if (p.includes('return the output as a json array') && p.includes('options')) return 'quiz';
  if (p.includes('generate 8-10 concise flashcards')) return 'flashcards';
  return 'chat';
}

function extractBlock(text: string, marker: string): string {
  const idx = text.indexOf(marker);
  return idx >= 0 ? text.slice(idx + marker.length).trim() : '';
}

function extractQuotedQuestion(text: string): string {
  const m = text.match(/question:\s*"([^"]+)"/i);
  return m?.[1] || '';
}

function extractMarkType(text: string): '2' | '5' | '10' {
  const m = text.match(/generate a\s*(2|5|10)-mark/i);
  return (m?.[1] as '2' | '5' | '10') || '5';
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function splitSentences(text: string): string[] {
  return normalize(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function topSentences(text: string, count: number): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [normalize(text).slice(0, 220) || 'No notes available.'];
  return sentences.slice(0, Math.min(count, sentences.length));
}

function trimWords(text: string, maxWords: number): string {
  const words = normalize(text).split(' ');
  if (words.length <= maxWords) return normalize(text);
  return `${words.slice(0, maxWords).join(' ')}...`;
}

function buildSummary(notes: string, maxWords: number): string {
  const chosen = topSentences(notes, 4).join(' ');
  return trimWords(chosen, maxWords);
}

function buildKeyPoints(notes: string, count: number): string[] {
  return topSentences(notes, count).map((s) => s.replace(/^[-*]\s*/, ''));
}

function buildTerms(notes: string, count: number): string[] {
  const cleaned = notes.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const stop = new Set([
    'the', 'and', 'for', 'that', 'with', 'this', 'from', 'into', 'your', 'you', 'are', 'was', 'were', 'have', 'has',
    'had', 'not', 'but', 'can', 'will', 'shall', 'would', 'could', 'about', 'then', 'than', 'when', 'where', 'which',
    'their', 'there', 'what', 'how', 'why', 'who', 'whom', 'been', 'being', 'also', 'very', 'much', 'more', 'most',
    'exam', 'study', 'notes'
  ]);

  const freq = new Map<string, number>();
  for (const token of cleaned.split(/\s+/)) {
    if (token.length < 4 || stop.has(token)) continue;
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([term]) => term);
}

function findRelevantSentences(text: string, query: string, count: number): string[] {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return [normalize(text).slice(0, 220) || 'No notes available.'];
  
  const stop = new Set(['what', 'describe', 'explain', 'how', 'why', 'who', 'the', 'and', 'for', 'with', 'about', 'is', 'are', 'was', 'were']);
  const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(t => t.length > 2 && !stop.has(t));
  
  if (queryTerms.length === 0) return sentences.slice(0, Math.min(count, sentences.length));

  const scored = sentences.map((s, index) => {
    const sLower = s.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      if (sLower.includes(term)) score += 10;
    }
    // slight boost for earlier sentences to maintain context order if equal score
    score -= (index * 0.001);
    return { s, score };
  });

  const relevant = scored.filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  
  if (relevant.length === 0) return sentences.slice(0, Math.min(count, sentences.length));
  
  return relevant.slice(0, count).map(x => x.s);
}

function buildRelevantKeyPoints(notes: string, query: string, count: number): string[] {
  return findRelevantSentences(notes, query, count).map((s) => s.replace(/^[-*]\s*/, ''));
}

function buildExamAnswer(notes: string, question: string, markType: '2' | '5' | '10'): string {
  const points = buildRelevantKeyPoints(notes, question, markType === '2' ? 2 : markType === '5' ? 4 : 7);
  if (markType === '2') {
    return `${question}: \n${trimWords(points.join(' '), 60)}`;
  }

  if (markType === '5') {
    return [
      `Introduction: ${trimWords(points[0] || 'This topic is important for exam understanding.', 35)}`,
      'Key Points:',
      ...points.slice(1, 4).map((p, i) => `${i + 1}. ${trimWords(p, 24)}`),
      `Conclusion: ${trimWords(points[points.length - 1] || points[0] || 'Revise core definitions and examples.', 22)}`
    ].join('\n');
  }

  return [
    `Introduction: ${trimWords(points[0] || 'This topic forms a core part of the syllabus.', 38)}`,
    '1) Core Concept:',
    trimWords(points[1] || points[0] || 'Define the concept clearly and relate it to use cases.', 34),
    '2) Detailed Explanation:',
    ...points.slice(2, 5).map((p, i) => `${i + 1}. ${trimWords(p, 30)}`),
    '3) Example/Application:',
    trimWords(points[5] || points[1] || 'Use a practical example from the notes to strengthen the answer.', 30),
    `Conclusion: ${trimWords(points[6] || points[0] || 'Summarize the idea and mention why it is exam-relevant.', 28)}`
  ].join('\n');
}

function buildQuiz(notes: string, count: number) {
  const terms = buildTerms(notes, Math.max(count, 12));
  const sentences = shuffle(splitSentences(notes)).slice(0, Math.max(count, 8));
  const fallback = ['concept', 'definition', 'application', 'process'];
  const pool = terms.length ? terms : fallback;

  return Array.from({ length: count }).map((_, i) => {
    const correct = pool[i % pool.length];
    const wrongA = pool[(i + 1) % pool.length];
    const wrongB = pool[(i + 2) % pool.length];
    const wrongC = pool[(i + 3) % pool.length];
    const options = shuffle([correct, wrongA, wrongB, wrongC]);
    const fact = sentences[i % sentences.length] || `This question is based on ${correct}.`;

    return {
      question: `Which term best matches this idea: "${trimWords(fact, 22)}"?`,
      options,
      answer: correct,
      explanation: `${correct} is the closest match to the described idea from your notes.`
    };
  });
}

function buildFlashcards(notes: string, count: number) {
  const terms = buildTerms(notes, count + 2);
  const cards = Array.from({ length: count }).map((_, i) => {
    const term = terms[i] || `Topic ${i + 1}`;
    const relevantSentences = findRelevantSentences(notes, term, 2);
    const answer = relevantSentences.join(' ') || `${term} is an important concept from your study notes.`;
    return {
      front: `What is ${term}?`,
      back: trimWords(answer, 60)
    };
  });
  return cards;
}

function extractContextNotes(messages: ChatMessage[]): string {
  const systemContext = messages.find(
    (m) => m.role === 'system' && m.content.includes('Study Notes Context:')
  )?.content;
  if (!systemContext) return '';
  return extractBlock(systemContext, 'Study Notes Context:');
}

function buildChatReply(notes: string, question: string, mode: string): string {
  const terms = buildTerms(notes || question, 5);
  const support = findRelevantSentences(notes || question, question, 3);

  if (mode === 'beginner') {
    return [
      'Simple explanation:',
      trimWords(support[0] || 'This topic is about understanding the main concept and how to use it.', 28),
      '',
      'Remember:',
      ...terms.slice(0, 3).map((t) => `- ${t}`)
    ].join('\n');
  }

  if (mode === 'concise') {
    return `Quick answer: ${trimWords(support.join(' '), 45)}`;
  }

  return [
    `Answer: ${trimWords(support[0] || 'Based on your notes, focus on the core definition and key application.', 32)}`,
    'Exam points to include:',
    ...support.slice(1).map((s, i) => `${i + 1}. ${trimWords(s, 25)}`),
    `Keywords: ${terms.join(', ')}`
  ].join('\n');
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

async function streamIfRequested(content: string, options: any): Promise<void> {
  if (!options?.onChunk) return;
  const chunks = chunkText(content, 120);
  let fullText = '';
  for (const chunk of chunks) {
    fullText += chunk;
    options.onChunk({ type: 'content', text: chunk, fullText });
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

function chunkText(text: string, size: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out;
}
