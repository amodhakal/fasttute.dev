import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";
import { api } from "./_generated/api";

export const insertTranscriptChunks = mutation({
  args: {
    chunks: v.array(
      v.object({
        videoId: v.id("video_info"),
        text: v.string(),
        offset: v.number(),
        duration: v.number(),
        embedding: v.array(v.float64()),
      }),
    ),
  },
  handler: async (ctx, { chunks }) => {
    for (const chunk of chunks) {
      await ctx.db.insert("transcript_chunks", chunk);
    }
  },
});

export const getChunk = query({
  args: { id: v.id("transcript_chunks") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const searchTranscript = action({
  args: {
    videoId: v.id("video_info"),
    query: v.string(),
  },
  handler: async (ctx, { videoId, query }) => {
    const GEMINI_KEY = process.env.GEMINI_KEY;
    if (!GEMINI_KEY) {
      throw new Error("Missing GEMINI_KEY");
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
    const embeddingResponse = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: query,
    });

    const queryEmbedding = embeddingResponse.embeddings?.[0]?.values;
    if (!queryEmbedding) {
      throw new Error("Failed to generate embedding for search query");
    }

    const results = await ctx.vectorSearch("transcript_chunks", "by_embedding", {
      vector: queryEmbedding,
      limit: 5,
      filter: (q) => q.eq("videoId", videoId),
    });

    const matchedChunks = await Promise.all(
      results.map(async (r) => {
        const chunk = await ctx.runQuery(api.transcriptSearch.getChunk, {
          id: r._id,
        });
        if (!chunk) return null;
        return {
          ...chunk,
          score: r._score,
        };
      }),
    );

    return matchedChunks.filter((item): item is NonNullable<typeof item> => item !== null);
  },
});
