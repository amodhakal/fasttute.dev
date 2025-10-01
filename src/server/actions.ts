"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Innertube from "youtubei.js";
import { Id } from "./_generated/dataModel";

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
  const maybe = error as unknown as { message?: string; cause?: unknown };
  const cause = maybe?.cause;
  let causeCode: string | undefined;
  let causeMessage: string | undefined;
  if (cause && typeof cause === "object") {
    const c = cause as Record<string, unknown>;
    if (typeof c.code === "string") {
      causeCode = c.code;
    }
    if (typeof c.message === "string") {
      causeMessage = c.message;
    }
  }

  if (
    causeCode === "ERR_INVALID_URL" ||
    (typeof maybe.message === "string" &&
      maybe.message.includes("Failed to parse URL")) ||
    (typeof maybe.message === "string" &&
      maybe.message.includes("[object Request]")) ||
    (typeof causeMessage === "string" && causeMessage.includes("Invalid URL"))
  ) {
    return { error: "Invalid request URL" };
  }

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
