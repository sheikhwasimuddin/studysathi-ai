import { MLCEngine, CreateMLCEngine } from '@mlc-ai/web-llm';
import type { ChatMessage } from '../types';

let engine: MLCEngine | null = null;
let isInitializing = false;
let modelName = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

export async function initWebLLM(onProgress?: (text: string) => void): Promise<MLCEngine | null> {
  if (engine) return engine;
  if (!(navigator as any).gpu) {
    console.error('WebGPU not supported on this browser.');
    return null;
  }
  
  if (isInitializing) {
    // wait until initialized
    while (isInitializing) {
      await new Promise(r => setTimeout(r, 500));
    }
    return engine;
  }
  
  isInitializing = true;
  try {
    engine = await CreateMLCEngine(modelName, {
      initProgressCallback: (progress) => {
        if (onProgress) {
          onProgress(progress.text);
        }
      }
    });
    return engine;
  } catch (err) {
    console.error('Failed to init WebLLM:', err);
    return null;
  } finally {
    isInitializing = false;
  }
}

export const webLlmProvider = {
  async chat(messages: ChatMessage[], options: any = {}) {
    // Intercept early to stream init progress
    const onChunk = options?.onChunk;
    
    if (!engine) {
      if (onChunk) {
        onChunk({ type: 'content', text: '\n[System]: Initializing WebGPU Local AI. This requires downloading the Llama model into your browser cache (approx 800MB) only the first time. Please wait...\n', fullText: '' });
      }
    }

    const localEngine = await initWebLLM((progressText) => {
      if (onChunk) {
        onChunk({ type: 'progress', text: `[Download]: ${progressText}\n`, fullText: '' });
      }
    });

    if (!localEngine) {
      throw new Error('WebLLM initialization failed. Browser might not support WebGPU.');
    }

    if (onChunk) {
      onChunk({ type: 'content', text: '\n[System]: AI Engine Ready! Generating response...\n\n', fullText: '' });
    }

    // Convert messages for MLC format, ensuring role is system, user, or assistant
    const mlcMessages = messages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content
    }));

    if (onChunk) {
      const asyncChunkGenerator = await localEngine.chat.completions.create({
        messages: mlcMessages,
        stream: true,
      });

      let fullText = '';
      for await (const chunk of asyncChunkGenerator) {
        const text = chunk.choices[0]?.delta?.content || '';
        fullText += text;
        onChunk({ type: 'content', text, fullText });
      }
      return { content: fullText };
    } else {
      const response = await localEngine.chat.completions.create({
        messages: mlcMessages,
        stream: false,
      });
      return { content: response.choices[0]?.message?.content || '' };
    }
  }
};
