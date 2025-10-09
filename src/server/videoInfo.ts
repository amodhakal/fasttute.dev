/**
 * Based on https://github.com/youtube-transcript-plus/youtube-transcript-api
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { vChapters, vStatus, vTranscript } from "./schema/videoInfo";
import { api } from "./_generated/api";
import { aiVideoProcessingHandler } from "@/utils/ai/chapters";
import {
  getTranscriptValuesFromSegment,
  getYoutubeId,
  handleError,
  RetrievalReturn,
} from "@/utils/transcript";
import Innertube from "youtubei.js";

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
    youtubeId: v.optional(v.string()),
  },
  handler: async (ctx, { youtubeId }) => {
    if (!youtubeId) {
      return null;
    }

    try {
      const foundVideo = await ctx.db
        .query("video_info")
        .filter((q) => q.eq(q.field("youtubeId"), youtubeId))
        .first();
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
    ownerId: v.optional(v.string()),
  },
  handler: async (ctx, { youtubeId, title, transcript, ownerId }) => {
    const newVideoId = await ctx.db.insert("video_info", {
      youtubeId,
      title,
      ownerId,
      transcript: transcript.map((item) => ({
        ...item,
        offset: Math.floor(item.offset),
      })),
      status: "pending",
    });

    return newVideoId;
  },
});

export const updateStatus = mutation({
  args: { id: v.id<"video_info">("video_info"), status: vStatus() },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

export const updateWithNewValues = mutation({
  args: {
    id: v.id<"video_info">("video_info"),
    status: vStatus(),
    chapters: vChapters(),
  },
  handler: async (ctx, { id, status, chapters }) => {
    await ctx.db.patch(id, {
      status,
      chapters: chapters.map((item) => ({
        ...item,
        offset: Math.floor(item.offset),
      })),
    });
  },
});
