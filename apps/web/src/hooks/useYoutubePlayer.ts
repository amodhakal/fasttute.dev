/* eslint-disable @typescript-eslint/no-explicit-any */

import { Doc } from "@fasttute/backend/api";
import { useEffect, useRef } from "react";

export type YTPlayer = {
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime?: () => number;
  destroy?: () => void;
};

export type SkipSegment = {
  startOffset: number;
  endOffset: number;
  reason: string;
};

export function useYouTubePlayer(
  video: Doc<"video_info"> | null | undefined,
  setStartTime: (n: number) => void,
  playerRef: React.RefObject<YTPlayer | null>,
  playerDivRef: React.RefObject<HTMLDivElement | null>,
  skipSegments: SkipSegment[] = [],
) {
  const lastSkippedRef = useRef<number>(0);

  useEffect(() => {
    if (!video || !playerDivRef.current) {
      return;
    }

    const videoId = video.youtubeId;
    if (!videoId) {
      return;
    }

    let mounted = true;
    loadAPI().then(() => {
      if (!mounted) {
        return;
      }

      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
      }

      (playerRef as React.MutableRefObject<YTPlayer | null>).current = new (
        window as any
      ).YT.Player(playerDivRef.current, {
        videoId,
        events: {},
        playerVars: {
          start: 0,
          autoplay: 0,
          playsinline: 1,
        },
      }) as unknown as YTPlayer;
    });

    return () => {
      mounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {}
      }

      (playerRef as React.MutableRefObject<YTPlayer | null>).current = null;
    };

    function loadAPI() {
      return new Promise<any>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
          return resolve((window as any).YT);
        }

        const existing = document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]',
        );
        if (!existing) {
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }

        (window as any).onYouTubeIframeAPIReady = () => {
          resolve((window as any).YT);
        };
      });
    }
  }, [video, playerDivRef, playerRef]);

  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current;
      if (p && typeof p.getCurrentTime === "function") {
        try {
          const secs = Math.floor(
            (p.getCurrentTime && p.getCurrentTime()) || 0,
          );
          setStartTime(secs);

          if (skipSegments.length > 0) {
            const currentSegment = skipSegments.find(
              (seg) => secs >= seg.startOffset && secs < seg.endOffset,
            );
            if (currentSegment && secs > lastSkippedRef.current) {
              lastSkippedRef.current = currentSegment.endOffset;
              if (p.seekTo) {
                p.seekTo(currentSegment.endOffset, true);
              }
            }
            if (secs >= currentSegment?.endOffset) {
              lastSkippedRef.current = secs;
            }
          }
        } catch {}
      }
    }, 1000);
    return () => clearInterval(t);
  }, [setStartTime, playerRef, skipSegments]);
}
