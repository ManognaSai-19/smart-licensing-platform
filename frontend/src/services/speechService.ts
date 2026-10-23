/**
 * Smart Digital Licensing Platform - Web Speech Service
 * Progressive enhancement wrapper for SpeechRecognition (STT) and SpeechSynthesis (TTS)
 * Supports Telugu (te-IN) and Indian English (en-IN).
 */

export interface RecognitionOptions {
  lang?: string;
  onInterimResult?: (transcript: string) => void;
  onFinalResult: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface SpeakOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

// Browser SpeechRecognition definition
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

let activeRecognition: any = null;

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  const win = window as IWindow;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
};

export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

/**
 * Starts speech recognition session with progressive callbacks
 */
export const startListening = (options: RecognitionOptions): boolean => {
  if (!isSpeechRecognitionSupported()) {
    if (options.onError) {
      options.onError('Browser does not support Web Speech Recognition.');
    }
    return false;
  }

  try {
    stopListening();

    const win = window as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = options.lang || 'en-IN';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      let confidence = 0.85;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
          if (item[0].confidence && item[0].confidence > 0) {
            confidence = item[0].confidence;
          }
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim && options.onInterimResult) {
        options.onInterimResult(interim);
      }

      if (final) {
        options.onFinalResult(final.trim(), confidence);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (options.onError) {
        options.onError(event.error || 'Speech recognition failed');
      }
    };

    recognition.onend = () => {
      activeRecognition = null;
      if (options.onEnd) {
        options.onEnd();
      }
    };

    activeRecognition = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    console.error('Failed to start speech recognition:', err);
    if (options.onError) {
      options.onError(err.message || 'Could not start recognition');
    }
    return false;
  }
};

/**
 * Stops active speech recognition
 */
export const stopListening = (): void => {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // Ignore if already stopped
    }
    activeRecognition = null;
  }
};

/**
 * Synthesizes spoken audio prompt with bilingual voice matching
 */
export const speakPrompt = (text: string, options: SpeakOptions = {}): void => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  cancelSpeech();

  const lang = options.lang || 'en-IN';
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = options.rate ?? 0.95;
  utterance.pitch = options.pitch ?? 1.0;

  // Attempt to select the most appropriate localized voice
  const selectVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let chosenVoice: SpeechSynthesisVoice | undefined;

      if (lang.startsWith('te')) {
        chosenVoice = voices.find(v => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu'));
      } else {
        chosenVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === 'en-in')
          || voices.find(v => v.lang.toLowerCase().startsWith('en-gb'))
          || voices.find(v => v.lang.toLowerCase().startsWith('en-us'))
          || voices.find(v => v.lang.toLowerCase().startsWith('en'));
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
    }
  };

  selectVoice();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = selectVoice;
  }

  if (options.onStart) {
    utterance.onstart = () => options.onStart!();
  }
  if (options.onEnd) {
    utterance.onend = () => options.onEnd!();
  }
  if (options.onError) {
    utterance.onerror = (e) => options.onError!(e);
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Cancels any ongoing audio playback
 */
export const cancelSpeech = (): void => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
};

/**
 * Client-side fast normalization for common voice tokens
 */
export const clientNormalizeTranscript = (
  raw: string,
  dataType: string,
  _lang: string = 'en'
): string => {
  if (!raw) return '';
  let cleaned = raw.trim();

  // Convert Telugu digits
  cleaned = cleaned.replace(/[\u0C66-\u0C6F]/g, (match) => {
    return String(match.charCodeAt(0) - 0x0C66);
  });

  if (dataType === 'NUMBER') {
    const digitsOnly = cleaned.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 0) return digitsOnly;
  }

  return cleaned;
};
