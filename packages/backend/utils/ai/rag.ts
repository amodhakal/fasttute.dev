import { GoogleGenAI } from "@google/genai";

export async function processTranscriptEmbeddings(
  videoId: string,
  transcript: Array<{ text: string; offset: number; duration: number }>,
  runMutation: <Args>(name: string, args: Args) => Promise<any>,
) {
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    throw new Error("Missing GEMINI_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  // Chunk transcript segments into blocks of ~8 segments or ~400 characters
  const chunks: Array<{ text: string; offset: number; duration: number }> = [];
  let currentChunkText = "";
  let currentOffset = 0;
  let currentDuration = 0;
  let count = 0;

  for (const seg of transcript) {
    if (count === 0) {
      currentOffset = seg.offset;
    }
    currentChunkText += " " + seg.text;
    currentDuration += seg.duration || 0;
    count++;

    if (count >= 8 || currentChunkText.length > 400) {
      chunks.push({
        text: currentChunkText.trim(),
        offset: currentOffset,
        duration: currentDuration,
      });
      currentChunkText = "";
      count = 0;
      currentDuration = 0;
    }
  }

  if (currentChunkText.trim().length > 0) {
    chunks.push({
      text: currentChunkText.trim(),
      offset: currentOffset,
      duration: currentDuration,
    });
  }

  const chunkData = [];
  for (const chunk of chunks) {
    try {
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: chunk.text,
      });
      const embedding = response.embeddings?.[0]?.values;
      if (embedding) {
        chunkData.push({
          videoId: videoId as any,
          text: chunk.text,
          offset: chunk.offset,
          duration: chunk.duration,
          embedding,
        });
      }
    } catch (err) {
      console.error("Failed to generate embedding for transcript chunk:", err);
    }
  }

  if (chunkData.length > 0) {
    await runMutation("transcriptSearch:insertTranscriptChunks", {
      chunks: chunkData,
    });
  }
}
