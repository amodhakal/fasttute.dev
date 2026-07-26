import { defineTable } from "convex/server";
import { v } from "convex/values";

export const transcriptChunks = defineTable({
  videoId: v.id("video_info"),
  text: v.string(),
  offset: v.number(),
  duration: v.number(),
  embedding: v.array(v.float64()),
})
  .index("by_videoId", ["videoId"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768,
  });
