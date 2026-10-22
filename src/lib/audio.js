// Replaying an effect or changing music can interrupt an outstanding play request.
export function playAudio(audio) {
  return audio.play().catch(error => {
    if (error.name !== 'AbortError') window.logError('[audio] Playback failed', error);
  });
}
