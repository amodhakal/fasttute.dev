/**
 * Based on https://github.com/youtube-transcript-plus/youtube-transcript-api
 */

import { v, GenericId } from "convex/values";
import { mutation, query } from "./_generated/server";
// No need to import `Id` here; handler will accept either an Id or string.
import { vTranscript } from "./schema";
import { Id } from "./_generated/dataModel";

export const getIdFromYoutubeId = query({
  args: { youtubeId: v.string() },
  handler: async (ctx, { youtubeId }) => {
    const video = await ctx.db
      .query("video_info")
      .withIndex("by_youtubeId", (q) => q.eq("youtubeId", youtubeId))
      .first();

    return video?._id ?? null;
  },
});

export const getVideo = query({
  args: {
    id: v.optional(v.string()),
  },
  handler: async (ctx, { id }) => {
    if (!id) {
      return null;
    }

    try {
      const foundVideo = await ctx.db.get(id as Id<"video_info">);
      return foundVideo;
    } catch {
      return null;
    }
  },
});

export const insertVideoInfo = mutation({
  args: {
    youtubeId: v.string(),
    title: v.string(),
    transcript: vTranscript(),
  },
  handler: async (ctx, { youtubeId, title, transcript }) => {
    const newVideoId = await ctx.db.insert("video_info", {
      youtubeId,
      title,
      transcript,
    });

    return newVideoId;
  },
});
