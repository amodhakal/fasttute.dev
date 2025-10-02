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

export const vCleanedTranscript = () =>
  v.array(
    v.object({
      text: v.string(),
      startSec: v.number(),
      endSec: v.number(),
    })
  );

export const vChapters = () =>
  v.array(
    v.object({
      title: v.string(),
      offset: v.number(),
    })
  );

export const vStatus = () =>
  v.union(
    v.literal("pending"), //
    v.literal("completed"),
    v.literal("failed")
  );

const video_info = defineTable({
  youtubeId: v.string(),
  title: v.string(),
  transcript: vTranscript(),
  status: vStatus(),
  chapters: v.optional(vChapters()),
  vCleanedTranscript: v.optional(vCleanedTranscript()),
}).index("by_youtubeId", ["youtubeId"]);

export default defineSchema({
  video_info,
});
