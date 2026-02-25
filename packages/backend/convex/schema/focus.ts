import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vSkipSegments = () =>
  v.array(
    v.object({
      startOffset: v.number(),
      endOffset: v.number(),
      reason: v.string(),
    }),
  );

export const videoFocus = defineTable({
  videoId: v.id("video_info"),
  segments: vSkipSegments(),
  generatedAt: v.number(),
}).index("by_videoId", ["videoId"]);
