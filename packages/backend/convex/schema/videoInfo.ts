import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vTranscript = () =>
  v.array(
    v.object({
      text: v.string(),
      offset: v.number(),
      duration: v.number(),
    }),
  );

export const vChapters = () =>
  v.array(
    v.object({
      title: v.string(),
      offset: v.number(),
    }),
  );

export const vStatus = () =>
  v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"));

export const videoInfo = defineTable({
  ownerId: v.optional(v.string()),
  youtubeId: v.string(),
  title: v.string(),
  transcript: vTranscript(),
  status: vStatus(),
  chapters: v.optional(vChapters()),
}).index("by_youtubeId", ["youtubeId"]);
