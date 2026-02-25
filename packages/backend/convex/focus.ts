import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { generateFocusSegments } from "../utils/ai/focus";
import { vSkipSegments } from "./schema/focus";

export const getFocusSegments = query({
  args: { videoId: v.id("video_info") },
  handler: async (ctx, { videoId }) => {
    const focusData = await ctx.db
      .query("video_focus")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .first();

    return focusData?.segments ?? null;
  },
});

export const generateFocusSegmentsForVideo = action({
  args: { videoId: v.id("video_info") },
  handler: async (ctx, { videoId }) => {
    const video = await ctx.db.get(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const existingFocus = await ctx.db
      .query("video_focus")
      .withIndex("by_videoId", (q) => q.eq("videoId", videoId))
      .first();

    if (existingFocus) {
      return existingFocus.segments;
    }

    const segments = await generateFocusSegments(video.transcript);

    const focusId = await ctx.db.insert("video_focus", {
      videoId,
      segments,
      generatedAt: Date.now(),
    });

    return segments;
  },
});
