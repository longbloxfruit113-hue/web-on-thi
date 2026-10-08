// Web Audio API Sound Synthesizer + Authentic Audio File Player with Zero Delay

let audioCtx: AudioContext | null = null;
let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Lazy init & preload authentic recorded MP3 voice files
 */
export function getVoiceAudioElements() {
  if (typeof window === "undefined") return { correct: null, wrong: null };

  if (!correctAudio) {
    correctAudio = new Audio("/sounds/correct.mp3");
    correctAudio.preload = "auto";
    correctAudio.load();
  }
  if (!wrongAudio) {
    wrongAudio = new Audio("/sounds/wrong.mp3");
    wrongAudio.preload = "auto";
    wrongAudio.load();
  }

  return { correct: correctAudio, wrong: wrongAudio };
}

/**
 * Preload and warm up audio buffers
 */
export function initAudio() {
  getAudioContext();
  getVoiceAudioElements();
}

/**
 * Play a bright, cheerful "ting-ting" chime sound using Web Audio API
 */
export function playCorrectChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // First note: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note (harmonic ting): A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.25, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn("Could not play correct chime:", err);
  }
}

/**
 * Play authentic recorded MP3 voice for Correct ("Tốt tốt")
 */
export function playCorrectVoice() {
  const { correct } = getVoiceAudioElements();
  if (correct) {
    try {
      correct.pause();
      correct.currentTime = 0;
      correct.volume = 1.0;
      const playPromise = correct.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio element play error, falling back to TTS:", err);
          fallbackTTS("Tốt, tốt!", "correct");
        });
      }
    } catch {
      fallbackTTS("Tốt, tốt!", "correct");
    }
  } else {
    fallbackTTS("Tốt, tốt!", "correct");
  }
}

/**
 * Play authentic recorded MP3 voice for Wrong ("Sai rồi con tuất") - INSTANT ZERO DELAY
 */
export function playWrongVoice() {
  const { wrong } = getVoiceAudioElements();
  if (wrong) {
    try {
      wrong.pause();
      wrong.currentTime = 0;
      wrong.volume = 1.0;
      const playPromise = wrong.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio element play error, falling back to TTS:", err);
          fallbackTTS("Sai rồi con tuất!", "wrong");
        });
      }
    } catch {
      fallbackTTS("Sai rồi con tuất!", "wrong");
    }
  } else {
    fallbackTTS("Sai rồi con tuất!", "wrong");
  }
}

/**
 * Fallback SpeechSynthesis if browser blocks audio element
 */
function fallbackTTS(phrase: string, mood: "correct" | "wrong") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "vi-VN";
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(
      (v) => v.lang.toLowerCase().includes("vi") || v.lang.toLowerCase().includes("vn")
    );
    if (viVoice) utterance.voice = viVoice;

    if (mood === "correct") {
      utterance.pitch = 1.25;
      utterance.rate = 1.1;
    } else {
      utterance.pitch = 0.95;
      utterance.rate = 1.05;
    }
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("TTS fallback error:", err);
  }
}

/**
 * Combined sound feedback: Plays IMMEDIATELY without any delay or hesitation
 */
export function playQuizFeedback(isCorrect: boolean, isMuted = false) {
  if (isMuted) return;

  if (isCorrect) {
    // Play light pleasant chime + authentic voice "Tốt tốt" immediately
    playCorrectChime();
    playCorrectVoice();
  } else {
    // Play authentic voice "Sai rồi con tuất" INSTANTLY with zero delay / no stutter
    playWrongVoice();
  }
}
