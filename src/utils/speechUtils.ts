/**
 * Voice utilities for Mashunya.
 * Primary voice comes from the Hromada Social server (ElevenLabs), so every
 * user hears the same Mashunya voice. Browser speech is only a fallback.
 */

export function playVoiceBeep(type: 'start' | 'end' | 'error' = 'start') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'start') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'end') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (_) {
    // Ignore autoplay/audio-context restrictions.
  }
}

function cleanSpeechText(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\*_`#>\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Server-side ElevenLabs is the primary path. If the server TTS is unavailable,
 * use the best Ukrainian voice available in the browser as a safety fallback.
 */
export function speakGentleUkVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void,
  speechRate: number = 0.95
): () => void {
  if (typeof window === 'undefined') {
    onEnd?.();
    return () => {};
  }

  const cleanText = cleanSpeechText(text);
  if (!cleanText) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis?.cancel();
  let cancelled = false;
  let audio: HTMLAudioElement | null = null;
  let objectUrl: string | null = null;
  let fallbackCancel: (() => void) | null = null;

  const cleanup = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    audio = null;
  };

  const finish = () => {
    cleanup();
    if (!cancelled) onEnd?.();
  };

  const useBrowserFallback = () => {
    if (cancelled) return;
    if (!('speechSynthesis' in window)) {
      onError?.();
      onEnd?.();
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = synth.getVoices();
    const ukVoice = voices.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return lang === 'uk-ua' || lang.startsWith('uk-') || lang === 'uk' || name.includes('ukrainian') || name.includes('україн');
    });

    utterance.lang = 'uk-UA';
    if (ukVoice) utterance.voice = ukVoice;
    utterance.pitch = 1;
    utterance.rate = Math.max(0.8, Math.min(1.05, speechRate));
    utterance.volume = 1;
    utterance.onstart = () => onStart?.();
    utterance.onend = () => { if (!cancelled) onEnd?.(); };
    utterance.onerror = () => { if (!cancelled) { onError?.(); onEnd?.(); } };
    fallbackCancel = () => synth.cancel();
    synth.speak(utterance);
  };

  (async () => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });
      if (!response.ok) throw new Error(`TTS ${response.status}`);
      const blob = await response.blob();
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      audio = new Audio(objectUrl);
      audio.preload = 'auto';
      audio.onplay = () => onStart?.();
      audio.onended = finish;
      audio.onerror = () => {
        cleanup();
        useBrowserFallback();
      };
      await audio.play();
    } catch (error) {
      console.warn('Server TTS unavailable, using browser fallback:', error);
      useBrowserFallback();
    }
  })();

  return () => {
    cancelled = true;
    fallbackCancel?.();
    cleanup();
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** Creates browser Web Speech Recognition tuned for Ukrainian. */
export function createSpeechRecognizer(
  onResult: (text: string, isFinal: boolean) => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = 'uk-UA';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => playVoiceBeep('start');

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      else interimTranscript += event.results[i][0].transcript;
    }
    if (finalTranscript) onResult(finalTranscript.trim(), true);
    else if (interimTranscript) onResult(interimTranscript.trim(), false);
  };

  recognition.onend = () => {
    playVoiceBeep('end');
    onEnd?.();
  };

  recognition.onerror = (event: any) => {
    console.warn('SpeechRecognition error:', event.error);
    if (event.error !== 'no-speech') playVoiceBeep('error');
    onError?.(event.error);
  };

  return recognition;
}
