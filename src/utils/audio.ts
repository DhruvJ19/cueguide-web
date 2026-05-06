export function playAudio(text: string, voicePreference: string = 'female') {
  if (!window.speechSynthesis) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  
  // Simple heuristic for female/male if available
  let selectedVoice = voices.find(v => 
    voicePreference === 'female' ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('karen')
    : v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel')
  );

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
}
