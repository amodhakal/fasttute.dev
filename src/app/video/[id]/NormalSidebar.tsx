import type { Doc } from "@/server/_generated/dataModel";
import { Dispatch, RefObject, SetStateAction } from "react";
import { YTPlayer } from "./page";
import TranscriptItem from "./TranscriptItem";
import { fetchAction } from "convex/nextjs";
import { api } from "@/server/_generated/api";

type NormalSidebarProps = {
  video: Doc<"video_info">;
  startTime: number;
  setStartTime: Dispatch<SetStateAction<number>>;
  playerRef: RefObject<YTPlayer | null>;
};

export default function NormalSidebar({
  video,
  startTime,
  setStartTime,
  playerRef,
}: NormalSidebarProps) {
  if (video.status === "completed") {
    return null;
  }

  return (
    <div className="min-w-0">
      {video.status === "pending" && (
        <div className="rounded-lg shadow p-2 bg-gray-50 mb-2">
          Enhancing with AI...
        </div>
      )}
      {
        // TODO If the owner is the current user, allow them to regenerate the chapters
        video.status === "failed" && (
          <div className="rounded-lg shadow p-2 bg-red-600 text-white mb-2 flex flex-col gap-2">
            <div className="">AI enchancement failed due to an error.</div>
            <button
              onClick={async () =>
                await fetchAction(api.videoInfo.regenerate, {
                  youtubeId: video.youtubeId,
                })
              }
              className="rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700"
            >
              Retry
            </button>
          </div>
        )
      }
      {video.transcript.map((transcriptItem) => (
        <TranscriptItem
          key={crypto.randomUUID()}
          transcriptItem={transcriptItem}
          startTime={startTime}
          setStartTime={setStartTime}
          onSeek={(secs: number) => {
            const p = playerRef.current;
            if (p && p.seekTo) {
              p.seekTo(secs, true);
            }
          }}
        />
      ))}
    </div>
  );
}
