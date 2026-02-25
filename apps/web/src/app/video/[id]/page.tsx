"use client";

import Header from "@/components/Header";
import {
  useYouTubePlayer,
  YTPlayer,
  SkipSegment,
} from "@/hooks/useYoutubePlayer";
import { api } from "@fasttute/backend/api";
import { useQuery, useAction } from "convex/react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import Chat from "./components/Chat";
import Chapters from "./components/Chapters";
import Transcripts from "./components/Transcripts";
import InvalidVideo from "./components/InvalidVideo";
import { VideoPageContext } from "@/hooks/useVideoPageContext";
import LoadingPage from "@/components/LoadingPage";
import { useAuth } from "@clerk/clerk-react";
import { fetchAction } from "convex/nextjs";
import Container from "@/components/Container";

export default function VideoPage() {
  const [startTime, setStartTime] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [focusLoading, setFocusLoading] = useState(false);
  const { id: youtubeId } = useParams();
  const video = useQuery(api.videoInfo.getVideo, {
    youtubeId: youtubeId?.toString(),
  });

  const focusSegments = useQuery(
    api.focus.getFocusSegments,
    video?._id ? { videoId: video._id } : "skip",
  );

  const generateFocusSegments = useAction(
    api.focus.generateFocusSegmentsForVideo,
  );

  const handleFocusToggle = async () => {
    if (focusMode) {
      setFocusMode(false);
      return;
    }

    if (!video?._id) return;

    if (!focusSegments || focusSegments.length === 0) {
      setFocusLoading(true);
      try {
        await generateFocusSegments({ videoId: video._id });
      } catch (e) {
        console.error("Failed to generate focus segments:", e);
      }
      setFocusLoading(false);
    }
    setFocusMode(true);
  };

  const playerRef = useRef<YTPlayer | null>(null);
  const playerDivRef = useRef<HTMLDivElement | null>(null);

  const skipSegments: SkipSegment[] =
    focusMode && focusSegments ? focusSegments : [];

  useYouTubePlayer(video, setStartTime, playerRef, playerDivRef, skipSegments);

  const [activeTab, setActiveTab] = useState("transcripts");
  const { userId } = useAuth();

  if (video === undefined) {
    return <LoadingPage />;
  }

  if (!video) {
    return <InvalidVideo youtubeId={youtubeId?.toString()} />;
  }

  const isUserVideoOwner = video.ownerId && video.ownerId === userId;

  return (
    <div className="">
      <Header />
      <Container className="bg-[#0a0a0a] pt-4 min-h-screen text-neutral-200">
        <VideoPageContext.Provider
          value={{ video, startTime, setStartTime, playerRef, onSeek }}
        >
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3">
              <div
                className="sticky top-0 w-full aspect-[16/9] flex flex-col gap-4"
                style={{ zIndex: 10 }}
              >
                <div className="flex justify-end">
                  <button
                    onClick={handleFocusToggle}
                    disabled={focusLoading}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      focusMode
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    } disabled:opacity-50`}
                  >
                    {focusLoading
                      ? "Analyzing..."
                      : focusMode
                        ? "Focus Mode On"
                        : "Focus Mode"}
                  </button>
                </div>
                <div
                  id="yt-player"
                  ref={playerDivRef}
                  className="aspect-video w-full h-full block border-0 rounded-lg"
                />
              </div>
            </div>
            <div className="xl:col-span-1">
              <Sidebar />
            </div>
          </div>
        </VideoPageContext.Provider>
      </Container>
    </div>
  );

  function Sidebar() {
    return (
      <>
        {video?.status === "pending" && (
          <div className="rounded-lg shadow p-4 bg-gray-800 mb-2">
            Enhancing with AI...
          </div>
        )}
        {video?.status === "failed" && (
          <div className="rounded-lg shadow p-4 bg-gray-800 text-white mb-2 flex gap-4 items-center justify-between">
            <div>AI enhancement failed due to an error.</div>
            {isUserVideoOwner && (
              <button
                onClick={async () =>
                  await fetchAction(api.retrieveVideoInfo.regenerate, {
                    youtubeId: video.youtubeId,
                  })
                }
                className="flex-shrink-0 h-12 w-16 px- flex items-center justify-center rounded-lg bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed"
              >
                Retry
              </button>
            )}
          </div>
        )}

        <div className="w-full">
          <div className="w-full xl:sticky flex">
            <button
              className={`px-3 h-10 flex-1 text-center border-b-2  ${
                activeTab === "chat"
                  ? " text-red-500 border-gray-500"
                  : "text-neutral-400 border-gray-800 hover:border-gray-700 hover:cursor-pointer"
              }`}
              onClick={() => setActiveTab("chat")}
            >
              Chat
            </button>
            {video?.status === "completed" && (
              <button
                className={`px-3 h-10 flex-1 text-center border-b-2  ${
                  activeTab === "chapters"
                    ? " text-red-500 border-gray-500"
                    : "text-neutral-400 border-gray-800 hover:border-gray-700 hover:cursor-pointer"
                }`}
                onClick={() => setActiveTab("chapters")}
              >
                Chapters
              </button>
            )}
            <button
              className={`px-3 h-10 flex-1 text-center border-b-2  ${
                activeTab === "transcripts"
                  ? " text-red-500 border-gray-500"
                  : "text-neutral-400 border-gray-800 hover:border-gray-700 hover:cursor-pointer"
              }`}
              onClick={() => setActiveTab("transcripts")}
            >
              Transcripts
            </button>
            <div className="h-10 w-full border-b-2 border-gray-800"></div>
          </div>
        </div>

        <div className="tab-content mt-4 flex-1 overflow-hidden">
          {activeTab === "chat" && <Chat />}
          {activeTab === "chapters" && video?.status === "completed" && (
            <Chapters />
          )}
          {activeTab === "transcripts" && <Transcripts />}
        </div>
      </>
    );
  }

  function onSeek(secs: number) {
    const p = playerRef.current;
    if (!p || !p.seekTo) {
      return;
    }

    p.seekTo(secs, true);
  }
}
