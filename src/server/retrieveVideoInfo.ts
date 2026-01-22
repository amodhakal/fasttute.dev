"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  getTranscriptValuesFromSegment,
  getYoutubeId,
  handleError,
  RetrievalReturn,
} from "@/utils/transcript";
import { api } from "./_generated/api";
import Innertube from "youtubei.js";
import { aiVideoProcessingHandler } from "@/utils/ai/chapters";
import { preconnect } from "react-dom";

export const retrieveVideoInfo = action({
  args: {
    youtubeUrlOrId: v.optional(v.string()),
    ownerId: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { youtubeUrlOrId, ownerId },
  ): Promise<RetrievalReturn> => {
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

      const youtube = await Innertube.create();

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
        ownerId,
        title: videoTitle,
        transcript,
      });

      await ctx.scheduler.runAfter(0, api.retrieveVideoInfo.processWithAI, {
        youtubeId,
      });

      return { youtubeId, error: null };
    } catch (err: unknown) {
      return { ...handleError(err), youtubeId: null };
    }
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

    await ctx.runAction(api.retrieveVideoInfo.processWithAI, { youtubeId });
  },
});
