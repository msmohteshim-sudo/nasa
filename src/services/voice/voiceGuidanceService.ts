// ─────────────────────────────────────────────────────────────────────────────
// ALTRON — Voice Guidance Service
// Uses the Web Speech API (SpeechSynthesis) to narrate step instructions.
// ─────────────────────────────────────────────────────────────────────────────

let voiceEnabled = false;

function speak(text: string) {
  if (!voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.92;
  utt.pitch = 1.0;
  utt.volume = 1.0;
  utt.lang = 'en-IN';
  window.speechSynthesis.speak(utt);
}

export const VoiceGuidanceService = {
  setEnabled(enabled: boolean) {
    voiceEnabled = enabled;
    if (!enabled) window.speechSynthesis?.cancel();
  },

  isEnabled() {
    return voiceEnabled;
  },

  announceStep(stepNumber: string, title: string, description: string) {
    speak(`Step ${stepNumber}. ${title}. ${description}`);
  },

  announceVerified(stepNumber: string) {
    speak(`Step ${stepNumber} verified. Proceed to next step.`);
  },

  announceDeviation(expectedAction: string, observedAction: string) {
    speak(
      `Procedure deviation detected. Expected: ${expectedAction}. Observed: ${observedAction}. Please follow the correct procedure.`
    );
  },

  announceSessionStart(experimentTitle: string) {
    speak(`ALTRON Experiment Session started. ${experimentTitle}. Monitoring active. Please follow on-screen instructions.`);
  },

  announceSessionComplete() {
    speak('Experiment session complete. All procedure steps have been verified. Generating report.');
  },

  announceSkipped(stepNumber: string) {
    speak(`Step ${stepNumber} was skipped and flagged in the audit log.`);
  },

  cancel() {
    window.speechSynthesis?.cancel();
  },
};
