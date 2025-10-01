"use server";

import Innertube from "youtubei.js";

/**
 * Based on https://github.com/youtube-transcript-plus/youtube-transcript-api
 */

export async function getVideoInformation(value: string) {
  if (!value) {
    return { error: "Missing value" };
  }

  const videoId = getVideoId(value);
  if (!videoId) {
    return { error: "Invalid value" };
  }

  try {
    const youtube = await Innertube.create({
      fetch: async (input: RequestInfo | URL, init?: RequestInit) =>
        globalThis.fetch(input, init),
    });

    const info = await youtube.getInfo(videoId);
    const videoTitle = info.basic_info?.title || "Unknown";

    const transcriptData = await info.getTranscript();
    const segments =
      transcriptData?.transcript?.content?.body?.initial_segments;
    if (!segments) {
      return { error: "No transcripts available" };
    }

    const formattedTranscript = segments.map((segment: AnySegment) => {
      let text = "";
      let offset = 0;
      let duration = 0;

      if (
        segment &&
        "transcript_segment_renderer" in segment &&
        segment.transcript_segment_renderer
      ) {
        const tsr =
          segment.transcript_segment_renderer as TranscriptSegmentRenderer;
        text = decodeHtmlEntities(extractTextFromSegment(tsr));
        offset = parseFloat(tsr.start_ms || "0") / 1000;
        duration =
          (parseFloat(tsr.end_ms || "0") - parseFloat(tsr.start_ms || "0")) /
          1000;
      } else if (
        segment &&
        "cue_group_renderer" in segment &&
        segment.cue_group_renderer?.cues?.[0]?.cue_renderer
      ) {
        const cue = segment.cue_group_renderer.cues[0].cue_renderer;
        text = decodeHtmlEntities(extractTextFromSegment(cue));
        offset = parseFloat(cue.start_offset_ms || "0") / 1000;
        duration = parseFloat(cue.duration_ms || "0") / 1000;
      } else {
        text = decodeHtmlEntities(extractTextFromSegment(segment));
        offset = 0;
        duration = 0;
        // segment here is narrowed to GenericSegment or the parts of AnySegment not caught above
        const genericSegment = segment as GenericSegment;
        if (
          genericSegment.start_ms &&
          typeof genericSegment.start_ms === "string"
        ) {
          offset = parseFloat(genericSegment.start_ms) / 1000;
        }
        if (
          genericSegment.duration_ms &&
          typeof genericSegment.duration_ms === "string"
        ) {
          duration = parseFloat(genericSegment.duration_ms) / 1000;
        } else if (
          genericSegment.end_ms &&
          typeof genericSegment.end_ms === "string" &&
          genericSegment.start_ms &&
          typeof genericSegment.start_ms === "string"
        ) {
          duration =
            (parseFloat(genericSegment.end_ms) -
              parseFloat(genericSegment.start_ms)) /
            1000;
        }
      }
      return { text, offset, duration };
    });

    const data = {
      videoTitle: decodeHtmlEntities(videoTitle),
      transcript: formattedTranscript,
    };

    console.log(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(
      `Error fetching transcript for ${videoId}:`,
      err.message,
      err.stack
    );
    let errorMessage = "Failed to fetch transcript.";

    if (err instanceof SyntaxError && err.message.includes("JSON")) {
      errorMessage =
        "Failed to process data from YouTube. The API response may be malformed or incomplete.";
    } else if (
      err.message.includes("private") ||
      err.message.includes("unavailable") ||
      err.message.includes("premiere") ||
      err.message.includes("live")
    ) {
      errorMessage =
        "Video is private, unavailable, a live stream, or a premiere without a processed transcript.";
    } else if (
      err.message.includes(" অঞ্চলের কারণে") ||
      err.message.includes("region-locked")
    ) {
      errorMessage = "The video is region-locked and unavailable.";
    } else if (
      err.message.includes("Transcripts are not available for this video")
    ) {
      errorMessage = "Transcripts are not available for this video.";
    }

    return { error: errorMessage };
  }
}

function getVideoId(value: string) {
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
    }

    if (url.hostname !== "www.youtube.com" && url.hostname !== "youtube.com") {
      return null;
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.substring("/embed/".length);
    }
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.substring("/shorts/".length);
    }
  } catch {}

  return null;
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
