// Speech Utilities for CYBER AI Personal Assistant

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// Check if Speech Recognition is supported
export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Start Speech Recognition
export class SpeechToTextEngine {
  private recognition: any = null;
  private isListening = false;

  constructor(
    private onTranscript: (text: string) => void,
    private onStateChange: (listening: boolean) => void,
    private onError: (error: string) => void
  ) {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false; // Stop when user stops speaking
      this.recognition.interimResults = false; // We only want final results

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange(true);
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          this.onTranscript(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        this.onError(event.error);
        this.isListening = false;
        this.onStateChange(false);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChange(false);
      };
    }
  }

  start(language: 'hinglish' | 'english' | 'hindi' = 'hinglish') {
    if (!this.recognition) {
      this.onError('Speech Recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.stop();
      return;
    }

    // Set the appropriate language code for optimal recognition
    if (language === 'hindi') {
      this.recognition.lang = 'hi-IN';
    } else if (language === 'hinglish') {
      // Hinglish uses Hindi language model, which captures both English and Hindi words perfectly
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-US';
    }

    try {
      this.recognition.start();
    } catch (e: any) {
      console.error('Error starting recognition:', e);
      this.onError(e.message);
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
  }
}

// Text to Speech Synthesizer
export class TextToSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  speak(text: string, language: 'hinglish' | 'english' | 'hindi' = 'hinglish', onEndCallback?: () => void) {
    if (!this.synth) return;

    // Stop any ongoing speech first
    this.stop();

    // Clean up text of any weird markdown symbols for smoother speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/`[^`]+`/g, 'code')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/[\n\r]+/g, ' ');

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);

    // Get list of voices
    const voices = this.synth.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (language === 'hindi') {
      selectedVoice = voices.find(v => v.lang.startsWith('hi-IN') || v.lang === 'hi') || null;
    } else if (language === 'hinglish') {
      // An Indian English voice ("en-IN") or Hindi voice ("hi-IN") works best for Hinglish!
      selectedVoice = voices.find(v => v.lang.startsWith('en-IN') || v.lang.startsWith('hi-IN')) || null;
    }

    // Fallback: search for English voices
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) || null;
    }

    if (selectedVoice) {
      this.currentUtterance.voice = selectedVoice;
    }

    // Adjust characteristics
    this.currentUtterance.rate = 1.05; // Slightly faster Jarvis-style articulate speed
    this.currentUtterance.pitch = 1.0; // Standard pitch

    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
      if (onEndCallback) onEndCallback();
    };

    this.currentUtterance.onerror = (e) => {
      console.error('TTS synthesis error:', e);
      this.currentUtterance = null;
      if (onEndCallback) onEndCallback();
    };

    this.synth.speak(this.currentUtterance);
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }
}

export const ttsEngine = new TextToSpeechEngine();
