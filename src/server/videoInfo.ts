/**
 * Based on https://github.com/youtube-transcript-plus/youtube-transcript-api
 */

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { vChapters, vStatus, vTranscript } from "./schema/videoInfo";
import { api } from "./_generated/api";
import { aiVideoProcessingHandler } from "@/utils/ai";
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
  },
  handler: async (ctx, { youtubeId, title, transcript }) => {
    const newVideoId = await ctx.db.insert("video_info", {
      youtubeId,
      title,
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

export const retrieveVideoInfo = action({
  args: { youtubeUrlOrId: v.optional(v.string()) },
  handler: async (ctx, { youtubeUrlOrId }): Promise<RetrievalReturn> => {
    try {
      if (!youtubeUrlOrId) {
        throw new Error("Missing YT value");
      }

      const youtubeId = getYoutubeId(youtubeUrlOrId);
      if (!youtubeId) {
        throw new Error("Invalid YT value");
      }

      const existingId = await ctx.runQuery(api.videoInfo.getIdFromYoutubeId, {
        youtubeId,
      });
      if (existingId) {
        return { youtubeId, error: null };
      }

      const youtube = await Innertube.create({
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          type RequestLike = {
            url?: string;
            method?: string;
            headers?: HeadersInit;
            body?: BodyInit | null;
          };

          try {
            const maybeReq = input as unknown;
            if (
              maybeReq &&
              typeof maybeReq === "object" &&
              "url" in (maybeReq as Record<string, unknown>) &&
              typeof (maybeReq as Record<string, unknown>).url === "string"
            ) {
              const req = maybeReq as RequestLike;
              const reqInit: RequestInit = {
                method: req.method,
                headers: req.headers,
                body: req.body,
                ...init,
              };
              return globalThis.fetch(req.url as string, reqInit);
            }
          } catch {}

          return globalThis.fetch(input as RequestInfo, init);
        },
      });

      const info = await youtube.getInfo(youtubeId);
      const videoTitle = info.primary_info?.title.text || "Unknown";
      const transcriptData = await info.getTranscript();
      const segments =
        transcriptData?.transcript?.content?.body?.initial_segments;
      if (!segments || segments.length === 0) {
        throw new Error("Transcripts unavailable");
      }

      const transcript = segments.map(getTranscriptValuesFromSegment);
      await ctx.runMutation(api.videoInfo.insertVideoInfo, {
        youtubeId,
        title: videoTitle,
        transcript,
      });

      await ctx.scheduler.runAfter(0, api.videoInfo.processWithAI, {
        youtubeId,
      });

      return { youtubeId, error: null };
    } catch (err: unknown) {
      return { ...handleError(err), youtubeId: null };
    }
  },
});

export const regenerate = action({
  args: { youtubeId: v.string() },
  handler: async (ctx, { youtubeId }) => {
    const video = await ctx.runQuery(api.videoInfo.getVideo, { youtubeId });
    if (!video) {
      return;
    }
    await ctx.runMutation(api.videoInfo.updateStatus, {
      id: video._id,
      status: "pending",
    });

    await ctx.runAction(api.videoInfo.processWithAI, { youtubeId });
  },
});

export const processWithAI = action({
  args: { youtubeId: v.string() },
  handler: async (ctx, { youtubeId }) => {
    const video = await ctx.runQuery(api.videoInfo.getVideo, { youtubeId });
    if (!video) {
      console.error(`Didn't find video info for id: ${youtubeId}`);
      return;
    }

    try {
      await aiVideoProcessingHandler(video);
    } catch (err) {
      console.error(err);
      await ctx.runMutation(api.videoInfo.updateStatus, {
        id: video._id,
        status: "failed",
      });
    }
  },
});
