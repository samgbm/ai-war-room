/** Transient TTS buffers keyed by short-lived audioId (hackathon in-memory store). */
export const audioCache = new Map<string, Buffer>();
