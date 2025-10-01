import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vTranscript = () =>
  v.array(
    v.object({
      text: v.string(),
      offset: v.number(),
      duration: v.number(),
    })
  );

export default defineSchema({
  video_info: defineTable({
    youtubeId: v.string(),
    title: v.string(),
    transcript: vTranscript(),
  }).index("by_youtubeId", ["youtubeId"]),
});
