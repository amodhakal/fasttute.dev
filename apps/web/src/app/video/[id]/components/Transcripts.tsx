import { useVideoPageContext } from "@/hooks/useVideoPageContext";
import TranscriptItem from "./TranscriptItem";

export default function Transcripts() {
  const { video, startTime, setStartTime, playerRef } = useVideoPageContext();

  if (!video.transcript) {
    return <div>No transcripts available.</div>;
  }

  const transcript = [...video.transcript];
  transcript.sort((a, b) => a.offset - b.offset);

  const seekTo = (secs: number) => {
    const p = playerRef.current;
    if (p && p.seekTo) {
      try {
        p.seekTo(secs, true);
      } catch {}
    }
  };

  return (
    <div className="space-y-2 min-w-0">
      {transcript.map((transcriptItem) => (
        <TranscriptItem
          key={crypto.randomUUID()}
          transcriptItem={transcriptItem}
          startTime={startTime}
          setStartTime={setStartTime}
          onSeek={(secs: number) => seekTo(secs)}
        />
      ))}
    </div>
  );
}