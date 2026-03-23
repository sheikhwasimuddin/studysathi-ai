import { runAnywhereSpeak, runAnywhereTranscribe } from './ai/providers/runAnywhereSdk';

/**
 * Voice service for TTS and STT.
 * Uses RunAnywhere SDK when available, falls back to Browser Speech APIs.
 */
export const voiceService = {
  async speak(text: string) {
    const used = await runAnywhereSpeak(text);
    if (used) return;

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  },

  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  async recognize(): Promise<string> {
    const audioBlob = await this.captureAudio();
    if (audioBlob) {
      const text = await runAnywhereTranscribe(audioBlob);
      if (text) return text;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported');
    }

    return new Promise((resolve, reject) => {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  },

  async captureAudio(): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => chunks.push(event.data);

      return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          stream.getTracks().forEach((track) => track.stop());
          resolve(blob);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 5000);
      });
    } catch {
      return null;
    }
  }
};
