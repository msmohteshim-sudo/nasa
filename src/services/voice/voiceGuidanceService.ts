// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Voice Guidance Service
// Uses the Web Speech API (SpeechSynthesis) to narrate step instructions.
// Includes cooldown, debounce, and state-change suppression to prevent spam.
// ─────────────────────────────────────────────────────────────────────────────

let voiceEnabled = false;
let lastSpokenText = '';
let lastSpokenTimestamp = 0;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

const COOLDOWN_MS = 2800; // Minimum time between separate voice announcements
const DUPLICATE_COOLDOWN_MS = 6000; // Suppress identical announcements within this duration

function speak(text: string, force = false) {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  const now = Date.now();

  // Suppress duplicates within duplicate cooldown window
  if (!force && text === lastSpokenText && now - lastSpokenTimestamp < DUPLICATE_COOLDOWN_MS) {
    return;
  }

  // Enforce general cooldown between distinct speech utterances
  if (!force && now - lastSpokenTimestamp < COOLDOWN_MS) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      speak(text, true);
    }, COOLDOWN_MS - (now - lastSpokenTimestamp));
    return;
  }

  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
    debounceTimeout = null;
  }

  window.speechSynthesis.cancel();
  lastSpokenText = text;
  lastSpokenTimestamp = now;

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  utt.lang = 'en-US';
  window.speechSynthesis.speak(utt);
}

export const VoiceGuidanceService = {
  setEnabled(enabled: boolean) {
    voiceEnabled = enabled;
    if (!enabled) {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      window.speechSynthesis?.cancel();
    }
  },

  isEnabled() {
    return voiceEnabled;
  },

  speak(text: string, force = false) {
    speak(text, force);
  },

  announceStep(stepNumber: string, title: string, description: string) {
    speak(`Step ${stepNumber}. ${title}. ${description}`);
  },

  announceVerified(stepNumber: string) {
    speak(`Step ${stepNumber} verified. Proceed to next step.`);
  },

  announceDeviation(expectedAction: string, observedAction: string) {
    speak(
      `Procedure deviation detected. Expected: ${expectedAction}. Observed: ${observedAction}. Please follow protocol.`
    );
  },

  announceOutOfOrder(stepNumber: string, observedAction: string) {
    speak(
      `Out of order action detected. Observed ${observedAction}. Please complete Step ${stepNumber} first.`
    );
  },

  announceSessionStart(experimentTitle: string) {
    speak(`ALTRON Experiment Session started. ${experimentTitle}. Monitoring active.`);
  },

  announceSessionComplete() {
    speak('Experiment session complete. All procedure steps have been verified.');
  },

  announceSkipped(stepNumber: string) {
    speak(`Step ${stepNumber} was skipped and flagged in the audit log.`);
  },

  cancel() {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    window.speechSynthesis?.cancel();
  },
};
