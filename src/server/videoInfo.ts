/**
 * Based on https://github.com/youtube-transcript-plus/youtube-transcript-api
 */

const BATCH_SIZE = 1;

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { vTranscript } from "./schema";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
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

export const createVideoInfoEntry = mutation({
  args: { youtubeId: v.string(), title: v.string() },
  handler: async (ctx, { youtubeId, title }) => {
    const newVideoId = await ctx.db.insert("video_info", {
      youtubeId,
      title,
      transcript: [],
    });

    return newVideoId;
  },
});

export const appendTranscript = mutation({
  args: { id: v.id("video_info"), transcript: vTranscript() },
  handler: async (ctx, { id, transcript }) => {
    const video = await ctx.db.get(id);
    if (!video) {
      throw new Error(`Video ${id} 404`);
    }

    const newTranscript = video.transcript.concat(transcript);
    await ctx.db.patch(id, { transcript: newTranscript });
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
        return { id: existingId, error: null };
      }

      const youtube = await Innertube.create({
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          globalThis.fetch(input, init),
      });

      const info = await youtube.getInfo(youtubeId);
      const videoTitle = info.basic_info?.title || "Unknown";
      const newVideoId = await ctx.runMutation(
        api.videoInfo.createVideoInfoEntry,
        {
          youtubeId,
          title: videoTitle,
        }
      );

      const transcriptData = await info.getTranscript();
      const segments =
        transcriptData?.transcript?.content?.body?.initial_segments;
      if (!segments) {
        return { id: newVideoId, error: null };
      }

      for (let idx = 0; idx < segments.length; idx += BATCH_SIZE) {
        const batch = segments.slice(idx, idx + BATCH_SIZE);
        const processedBatch = batch.map(getTranscriptValuesFromSegment);
        await ctx.runMutation(api.videoInfo.appendTranscript, {
          id: newVideoId,
          transcript: processedBatch,
        });
      }

      return { id: newVideoId, error: null };
    } catch (err: unknown) {
      return { ...handleError(err), id: null };
    }
  },
});

function getYoutubeId(value: string) {
  if (!value) {
    return null;
  }

  if (value.length === 11 && !value.includes("/") && !value.includes("?")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      return url.pathname.substring(1);
    } else if (
      url.hostname !== "www.youtube.com" &&
      url.hostname !== "youtube.com"
    ) {
      return null;
    } else if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    } else if (url.pathname.startsWith("/embed/")) {
      return url.pathname.substring("/embed/".length);
    } else if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.substring("/shorts/".length);
    }
  } catch {}

  return null;
}

function getTranscriptValuesFromSegment(segment: AnySegment): TranscriptValues {
  if (
    "transcript_segment_renderer" in segment &&
    segment.transcript_segment_renderer
  ) {
    const tsr =
      segment.transcript_segment_renderer as TranscriptSegmentRenderer;
    const text = decodeHtmlEntities(extractTextFromSegment(tsr));
    const offset = parseFloat(tsr.start_ms || "0") / 1000;
    const duration = parseFloat(tsr.end_ms || "0") / 1000 - offset;
    return { text, offset, duration };
  }

  if (
    "cue_group_renderer" in segment &&
    segment.cue_group_renderer?.cues?.[0]?.cue_renderer
  ) {
    const cue = segment.cue_group_renderer.cues[0].cue_renderer;
    const text = decodeHtmlEntities(extractTextFromSegment(cue));
    const offset = parseFloat(cue.start_offset_ms || "0") / 1000;
    const duration = parseFloat(cue.duration_ms || "0") / 1000;
    return { text, offset, duration };
  }

  const returningData = {
    text: decodeHtmlEntities(extractTextFromSegment(segment)),
    offset: 0,
    duration: 0,
  };

  const genericSegment = segment as GenericSegment;
  if (genericSegment.start_ms && typeof genericSegment.start_ms === "string") {
    returningData.offset = parseFloat(genericSegment.start_ms) / 1000;
  }

  if (
    genericSegment.duration_ms &&
    typeof genericSegment.duration_ms === "string"
  ) {
    returningData.duration = parseFloat(genericSegment.duration_ms) / 1000;
  } else if (
    genericSegment.end_ms &&
    typeof genericSegment.end_ms === "string" &&
    genericSegment.start_ms &&
    typeof genericSegment.start_ms === "string"
  ) {
    returningData.duration =
      (parseFloat(genericSegment.end_ms) -
        parseFloat(genericSegment.start_ms)) /
      1000;
  }

  return returningData;
}

function handleError(error: unknown) {
  const err = error as Error;
  if (err.message.includes("value")) {
    return { error: err.message };
  }

  console.error(err);

  if (err instanceof SyntaxError && err.message.includes("JSON")) {
    return { error: "Malformed YT data" };
  }

  for (const videoType of ["private", "unavailable", "premiere", "live"]) {
    if (!err.message.includes(videoType)) {
      continue;
    }

    return { error: `${videoType} video` };
  }

  if (
    err.message.includes(" অঞ্চলের কারণে") ||
    err.message.includes("region-locked")
  ) {
    return { error: "Region-locked video" };
  }

  return { error: "Transcript unavailable" };
}

function decodeHtmlEntities(text: string | undefined | null): string {
  if (!text) {
    return "";
  }

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTextFromSegment(segment: AnySegment): string {
  if (
    segment &&
    "transcript_segment_renderer" in segment &&
    segment.transcript_segment_renderer
  ) {
    const tsr =
      segment.transcript_segment_renderer as TranscriptSegmentRenderer;

    if (tsr.snippet?.text) {
      return tsr.snippet.text;
    } else if (tsr.text) {
      return tsr.text;
    } else if (tsr.snippet?.runs) {
      return tsr.snippet.runs.map((run) => run.text).join("");
    } else if (tsr.runs) {
      return tsr.runs.map((run) => run.text).join("");
    }
  }

  if (
    segment &&
    "cue_group_renderer" in segment &&
    segment.cue_group_renderer?.cues?.[0]?.cue_renderer
  ) {
    const cue = segment.cue_group_renderer.cues[0].cue_renderer;
    if (cue.text?.text) {
      return cue.text.text;
    } else if (cue.text?.runs) {
      return cue.text.runs.map((run) => run.text).join("");
    }
  }

  if (segment && "text" in segment && segment.text) {
    if (typeof segment.text === "string") {
      return segment.text;
    } else if (typeof segment.text === "object") {
      const snippet = segment.text as Snippet;
      if (snippet.text) {
        return snippet.text;
      } else if (snippet.runs) {
        return snippet.runs.map((run) => run.text).join("");
      }
    }
  }

  if (segment && "runs" in segment && Array.isArray(segment.runs)) {
    return (segment.runs as TextRun[]).map((run) => run.text).join("");
  }

  if (segment && "snippet" in segment && segment.snippet) {
    const snippet = segment.snippet as Snippet;
    if (snippet.text) {
      return snippet.text;
    } else if (snippet.runs) {
      return snippet.runs.map((run) => run.text).join("");
    }
  }

  return "";
}

type RetrievalReturn =
  | { id: Id<"video_info">; error: null }
  | { id: null; error: string };

type TranscriptValues = {
  text: string;
  offset: number;
  duration: number;
};

type TextRun = {
  text: string;
};

type Snippet = {
  text?: string;
  runs?: TextRun[];
};

type TranscriptSegmentRenderer = {
  snippet?: Snippet;
  text?: string;
  runs?: TextRun[];
  start_ms?: string;
  end_ms?: string;
};

type CueRenderer = {
  cue_renderer?: {
    text?: Snippet;
    start_offset_ms?: string;
    duration_ms?: string;
  };
};

type CueGroupRenderer = {
  cue_group_renderer?: {
    cues?: CueRenderer[];
  };
};

type GenericSegment = {
  text?: string | Snippet;
  runs?: TextRun[];
  snippet?: Snippet;
  start_ms?: string;
  end_ms?: string;
  duration_ms?: string;
};

type AnySegment = TranscriptSegmentRenderer | CueGroupRenderer | GenericSegment;
