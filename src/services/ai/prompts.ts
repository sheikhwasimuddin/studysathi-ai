export const SYSTEM_PROMPTS = {
  general: `You are StudySathi AI, a smart study assistant. Help students revise effectively. 
Prefer clear, structured, exam-friendly explanations. 
If study notes are provided, prioritize them for context and accuracy.`,
  
  beginner: `Explain the following study material in very simple language, as if teaching a beginner. 
Use short sentences, relatable examples, and avoid overly complex jargon. 
Break down concepts into small, digestible parts.`,
};

export const USER_PROMPTS = {
  summarize: (notes: string) => `Summarize the following study notes in an exam-focused way. 
Provide:
1. A concise summary (around 100-150 words)
2. 5–8 key bullet points
3. Important technical terms/keywords to remember

Notes:
${notes}`,

  generateAnswer: (notes: string, question: string, markType: string) => `Using the study material below, generate a ${markType}-mark exam answer for the following question: "${question}".

Guidelines:
- 2-mark: Concise, direct, accurate, and brief.
- 5-mark: Structured with introduction, key explanation points, and a concise conclusion.
- 10-mark: Detailed with introduction, side-headings, detailed explanation, examples (if relevant), and conclusion.

Study Material:
${notes}`,

  generateQuiz: (notes: string) => `Generate an exam-relevant quiz from the study notes below. 
Return the output as a JSON array of objects, where each object has:
- question: string
- options: string[] (for MCQs, provide 4 options)
- answer: string (the correct option or the direct answer)
- explanation: string (briefly explaining why)

Notes:
${notes}`,

  generateFlashcards: (notes: string) => `Generate 8-10 concise flashcards from the study notes below. 
Return the output as a JSON array of objects, where each object has:
- front: string (question/concept)
- back: string (short answer/definition)

Notes:
${notes}`,

  rephraseSimpler: (text: string) => `Rephrase the following text to be much simpler and easier to understand for a student:
${text}`,
};
