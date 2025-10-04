"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "@/server/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import InvalidVideo from "./InvalidVideo";
import NormalSidebar from "./NormalSidebar";
import CompletedSidebar from "./CompletedSidebar";

export default function VideoPage() {
  const [startTime, setStartTime] = useState(0);
  const { id: youtubeId } = useParams();
  const video = useQuery(api.videoInfo.getVideo, {
    youtubeId: youtubeId?.toString(),
  });

  const playerRef = useRef<YTPlayer | null>(null);
  const playerDivRef = useRef<HTMLDivElement | null>(null);

  useYouTubePlayer(video, setStartTime, playerRef, playerDivRef);

  if (video === undefined) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <p className="font-bold text-2xl">Loading video...</p>
      </div>
    );
  }

  if (!video) {
    return <InvalidVideo youtubeId={youtubeId?.toString()} />;
  }

  return (
    <div className="">
      <div className="md:hidden flex justify-center items-center h-screen w-screen">
        <p className="font-bold text-2xl">Please use a larger display</p>
      </div>

      <div className="hidden md:grid grid-cols-5 gap-4 p-4 w-full max-w-full">
        <div className="md:col-span-4">
          <div className="w-full aspect-video md:sticky top-4">
            <div
              id="yt-player"
              ref={playerDivRef}
              className="w-full h-full block border-0 rounded-lg"
            />
          </div>
        </div>

        <div className="md:relative md:col-span-1">
          <div className="md:absolute inset-0 overflow-y-auto flex flex-col gap-2">
            <NormalSidebar
              video={video}
              startTime={startTime}
              setStartTime={setStartTime}
              playerRef={playerRef}
            />
            <CompletedSidebar
              video={video}
              startTime={startTime}
              setStartTime={setStartTime}
              playerRef={playerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export type YTPlayer = {
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime?: () => number;
  destroy?: () => void;
};

function useYouTubePlayer(
  video: any,
  setStartTime: (n: number) => void,
  playerRef: React.RefObject<YTPlayer | null>,
  playerDivRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (!video || !playerDivRef.current) {
      return;
    }

    const videoId = video.youtubeId || video.youtubeID || undefined;
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

      playerRef.current = new (window as any).YT.Player(playerDivRef.current, {
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

      playerRef.current = null;
    };

    function loadAPI() {
      return new Promise<any>((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
          return resolve((window as any).YT);
        }

        const existing = document.querySelector(
          'script[src="https://www.youtube.com/iframe_api"]'
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
            (p.getCurrentTime && p.getCurrentTime()) || 0
          );
          setStartTime(secs);
        } catch {}
      }
    }, 1000);
    return () => clearInterval(t);
  }, [setStartTime, playerRef]);
}
