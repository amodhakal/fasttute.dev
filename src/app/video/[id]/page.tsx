"use client";

import Header from "@/components/Header";
import { useYouTubePlayer, YTPlayer } from "@/hooks/useYoutubePlayer";
import { api } from "@/server/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import Chat from "./Chat";
import CompletedSidebar from "./CompletedSidebar";
import InvalidVideo from "./InvalidVideo";
import NormalSidebar from "./NormalSidebar";
import { VideoPageContext } from "@/hooks/useVideoPageContext";
import LoadingPage from "@/components/LoadingPage";

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
    return <LoadingPage />;
  }

  if (!video) {
    return <InvalidVideo youtubeId={youtubeId?.toString()} />;
  }

  const onSeek = (secs: number) => {
    const p = playerRef.current;
    if (p && p.seekTo) {
      p.seekTo(secs, true);
    } else {
      setStartTime(secs);
    }
  };

  return (
    <div className="">
      <Header />
      <div className="md:hidden flex justify-center items-center h-screen w-screen">
        <p className="font-bold text-2xl">Please use a larger display</p>
      </div>

      <VideoPageContext.Provider
        value={{ video, startTime, setStartTime, playerRef, onSeek }}
      >
        <div className="hidden md:flex flex-col gap-4 p-4">
          <div className="grid grid-cols-5 gap-4 w-full max-w-full">
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
                <NormalSidebar />
                <CompletedSidebar />
              </div>
            </div>
          </div>

          <Chat />
        </div>
      </VideoPageContext.Provider>
    </div>
  );
}
