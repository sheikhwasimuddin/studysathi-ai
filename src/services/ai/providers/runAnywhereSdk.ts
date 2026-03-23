import { config } from '../../../lib/config';
import type { ChatMessage } from '../types';

type AnyFn = (...args: any[]) => any;

interface RunAnywhereLike {
  initialize?: AnyFn;
  chat?: AnyFn;
  generate?: AnyFn;
  generateStream?: AnyFn;
  complete?: AnyFn;
  completions?: { create?: AnyFn };
  llm?: {
    chat?: AnyFn;
    generate?: AnyFn;
    generateStream?: AnyFn;
    complete?: AnyFn;
  };
  stt?: { transcribe?: AnyFn };
  tts?: { speak?: AnyFn };
}

declare global {
  interface Window {
    RunAnywhere?: RunAnywhereLike;
  }
}

let initPromise: Promise<boolean> | null = null;

function getSdk(): RunAnywhereLike | null {
  if (typeof window === 'undefined') return null;
  return window.RunAnywhere || null;
}

async function tryInitialize(sdk: RunAnywhereLike): Promise<boolean> {
  const { apiKey, baseUrl } = config.runAnywhere;
  if (!apiKey || !baseUrl || !sdk.initialize) return false;

  try {
    await sdk.initialize({ apiKey, baseUrl });
    return true;
  } catch {
    try {
      await sdk.initialize(apiKey, baseUrl);
      return true;
    } catch {
      return false;
    }
  }
}

export async function initializeRunAnywhere(): Promise<boolean> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const sdk = getSdk();
    if (!sdk) return false;
    return tryInitialize(sdk);
  })();

  return initPromise;
}

function pickChatMethod(sdk: RunAnywhereLike): AnyFn | null {
  return (
    sdk.chat ||
    sdk.generate ||
    sdk.complete ||
    sdk.completions?.create ||
    sdk.llm?.chat ||
    sdk.llm?.generate ||
    sdk.llm?.complete ||
    null
  );
}

function toText(result: any): string {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (typeof result?.content === 'string') return result.content;
  if (typeof result?.text === 'string') return result.text;
  if (typeof result?.message?.content === 'string') return result.message.content;
  if (Array.isArray(result?.choices) && typeof result.choices[0]?.message?.content === 'string') {
    return result.choices[0].message.content;
  }
  return '';
}

export async function runAnywhereChat(messages: ChatMessage[], options: any = {}): Promise<{ content: string } | null> {
  if (config.strictOffline) return null;

  const initialized = await initializeRunAnywhere();
  if (!initialized) return null;

  const sdk = getSdk();
  if (!sdk) return null;

  const method = pickChatMethod(sdk);
  if (!method) return null;

  try {
    const result = await method({ messages, ...options });
    const content = toText(result);
    if (!content) return null;
    return { content };
  } catch {
    return null;
  }
}

export async function runAnywhereTranscribe(audioBlob: Blob): Promise<string | null> {
  if (config.strictOffline) return null;

  const initialized = await initializeRunAnywhere();
  if (!initialized) return null;

  const sdk = getSdk();
  const fn = sdk?.stt?.transcribe;
  if (!fn) return null;

  try {
    const result = await fn(audioBlob);
    if (typeof result === 'string') return result;
    if (typeof result?.text === 'string') return result.text;
    return null;
  } catch {
    return null;
  }
}

export async function runAnywhereSpeak(text: string): Promise<boolean> {
  if (config.strictOffline) return null as any;

  const initialized = await initializeRunAnywhere();
  if (!initialized) return false;

  const sdk = getSdk();
  const fn = sdk?.tts?.speak;
  if (!fn) return false;

  try {
    await fn(text);
    return true;
  } catch {
    return false;
  }
}

export async function * runAnywhereGenerateStream(
  messages: ChatMessage[],
  options: any = {}
): AsyncGenerator<string, void, unknown> {
  if (config.strictOffline) return;

  const initialized = await initializeRunAnywhere();
  if (!initialized) return;

  const sdk = getSdk();
  if (!sdk) return;

  const method = sdk.generateStream || sdk.llm?.generateStream;
  if (!method) return;

  try {
    const result = await method({ messages, ...options });
    if (result && typeof result[Symbol.asyncIterator] === 'function') {
      for await (const token of result) {
        if (typeof token === 'string') yield token;
        else if (typeof token?.text === 'string') yield token.text;
      }
    }
  } catch (error) {
    console.error('Stream generation error:', error);
  }
}
