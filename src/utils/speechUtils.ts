/**
 * Advanced Speech Synthesis & Speech Recognition Utility for Rokytne AI Voice Assistant (Mashunya)
 */

// Simple Audio Synthesizer Beep for tactile voice feedback
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
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'end') {
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15); // D5
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
  } catch (e) {
    // Ignore audio context auto-play restrictions
  }
}

/**
 * Speaks text using Ukrainian Web Speech Synthesis with gentle pitch and human speed
 */
export function speakGentleUkVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void,
  speechRate: number = 0.95
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip Markdown markers, code blocks, URLs for natural Ukrainian speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/[\*\_`\#\-\>]/g, ' ')
    .replace(/https?:\/\/\S+/g, 'посилання в інтернеті')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return () => {};
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Search for Ukrainian voices or fall back to uk-UA
  const voices = window.speechSynthesis.getVoices();
  const ukVoice = voices.find(v => 
    v.lang.startsWith('uk') || 
    v.lang.includes('UA') || 
    v.name.toLowerCase().includes('ukrainian') ||
    v.name.toLowerCase().includes('lesya')
  );

  if (ukVoice) {
    utterance.voice = ukVoice;
  }

  utterance.lang = 'uk-UA';
  utterance.pitch = 0.98; // Warm, natural voice tone
  utterance.rate = speechRate;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis error:', e);
    if (onError) onError();
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Creates browser Web Speech Recognition instance tuned for Ukrainian language
 */
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

  recognition.onstart = () => {
    playVoiceBeep('start');
  };

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onend = () => {
    playVoiceBeep('end');
    if (onEnd) onEnd();
  };

  recognition.onerror = (event: any) => {
    console.warn('SpeechRecognition error:', event.error);
    if (event.error !== 'no-speech') {
      playVoiceBeep('error');
    }
    if (onError) onError(event.error);
  };

  return recognition;
}
