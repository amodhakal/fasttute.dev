import { useVideoPageContext } from "@/hooks/useVideoPageContext";
import { api } from "@/server/_generated/api";
import { fetchAction } from "convex/nextjs";
import TranscriptItem from "./TranscriptItem";
import { useAuth } from "@clerk/clerk-react";

export default function NormalSidebar() {
  const { video, startTime, setStartTime, playerRef } = useVideoPageContext();
  const { userId } = useAuth();

  const isUserVideoOwner = video.ownerId && video.ownerId === userId;

  if (video.status === "completed") {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {video.status === "pending" && (
        <div className="rounded-lg shadow p-2 bg-gray-50 mb-2">
          Enhancing with AI...
        </div>
      )}
      {video.status === "failed" && (
        <div className="rounded-lg shadow p-2 bg-red-600 text-white mb-2 flex flex-col gap-2">
          <div className="">AI enchancement failed due to an error.</div>
          {isUserVideoOwner && (
            <button
              onClick={async () =>
                await fetchAction(api.retrieveVideoInfo.regenerate, {
                  youtubeId: video.youtubeId,
                })
              }
              className="rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700"
            >
              Retry
            </button>
          )}
        </div>
      )}
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
