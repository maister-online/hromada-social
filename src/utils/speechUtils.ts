/**
 * Voice utilities for Mashunya.
 * Uses the device/browser's built-in Web Speech API — no API key, Azure,
 * Gemini quota or paid TTS service required.
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

function getUkrainianVoice(): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return undefined;

  const voices = window.speechSynthesis.getVoices();
  const uk = voices.filter(v => {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    return lang === 'uk-ua' || lang.startsWith('uk-') || lang === 'uk' ||
      name.includes('ukrainian') || name.includes('україн');
  });

  // Prefer a local Ukrainian voice when one exists; otherwise use any Ukrainian voice.
  return uk.find(v => v.localService) || uk[0];
}

function waitForVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const synth = window.speechSynthesis;
    const immediate = synth.getVoices();
    if (immediate.length) {
      resolve(immediate);
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      synth.removeEventListener('voiceschanged', finish);
      resolve(synth.getVoices());
    };

    synth.addEventListener('voiceschanged', finish, { once: true });
    window.setTimeout(finish, timeoutMs);
  });
}

/**
 * Speaks Ukrainian text using the best Ukrainian voice available on the user's device.
 * Web Speech voices are supplied by the browser/OS and can differ between devices.
 */
export function speakGentleUkVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void,
  speechRate: number = 0.95
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return () => {};
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const cleanText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/https?:\/\/\S+/g, 'посилання в інтернеті')
    .replace(/[\*_`#>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return () => {};
  }

  let cancelled = false;
  void waitForVoices().then(() => {
    if (cancelled) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const ukVoice = getUkrainianVoice();

    utterance.lang = 'uk-UA';
    if (ukVoice) utterance.voice = ukVoice;
    utterance.pitch = 1.0;
    utterance.rate = Math.max(0.8, Math.min(1.05, speechRate));
    utterance.volume = 1;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (event) => {
      console.warn('SpeechSynthesis error:', event);
      onError?.();
      onEnd?.();
    };

    synth.speak(utterance);
  });

  return () => {
    cancelled = true;
    synth.cancel();
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
