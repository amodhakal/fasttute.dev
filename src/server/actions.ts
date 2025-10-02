"use node";

import {
  getTranscriptValuesFromSegment,
  getYoutubeId,
  handleError,
  RetrievalReturn,
} from "@/utils/transcript";
import { v } from "convex/values";
import Innertube from "youtubei.js";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { aiVideoProcessingHandler } from "@/utils/ai";

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
        return { id: existingId, error: null };
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
      const newVideoId = await ctx.runMutation(api.videoInfo.insertVideoInfo, {
        youtubeId,
        title: videoTitle,
        transcript,
      });

      await ctx.scheduler.runAfter(0, api.actions.processWithAI, {
        id: newVideoId,
      });

      return { id: newVideoId, error: null };
    } catch (err: unknown) {
      return { ...handleError(err), id: null };
    }
  },
});

export const processWithAI = action({
  args: { id: v.id("video_info") },
  handler: async (ctx, { id }) => {
    try {
      const video = await ctx.runQuery(api.videoInfo.getVideo, { id });
      if (!video) {
        console.error(`Didn't find video info for id: ${id}`);
        return;
      }

      await aiVideoProcessingHandler(video);
    } catch (err) {
      console.error(err);
      await ctx.runMutation(api.videoInfo.updateStatus, {
        id,
        status: "failed",
      });
    }
  },
});
