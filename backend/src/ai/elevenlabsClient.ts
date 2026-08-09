import { ElevenLabsClient } from "elevenlabs";

/** Rachel — ElevenLabs default pre-made voice. */
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

async function streamToBuffer(
  stream: AsyncIterable<Uint8Array | Buffer> | ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];

  if (Symbol.asyncIterator in Object(stream)) {
    for await (const chunk of stream as AsyncIterable<Uint8Array | Buffer>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  const reader = (stream as ReadableStream<Uint8Array>).getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

/**
 * Synthesize agent speech with a turbo TTS model.
 * Returns null on failure so the worker can degrade to text-only.
 */
export async function generateAgentAudio(text: string): Promise<Buffer | null> {
  try {
    const audio = await elevenlabs.textToSpeech.convert(DEFAULT_VOICE_ID, {
      text,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
    });

    const buffer = await streamToBuffer(
      audio as AsyncIterable<Uint8Array> | ReadableStream<Uint8Array>,
    );

    if (buffer.length === 0) {
      console.error("[elevenlabs] generateAgentAudio returned empty audio");
      return null;
    }

    return buffer;
  } catch (error) {
    console.error("[elevenlabs] generateAgentAudio failed:", error);
    return null;
  }
}
