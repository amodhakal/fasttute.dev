import { useVideoPageContext } from "@/hooks/useVideoPageContext";
import { useState } from "react";
import TranscriptItem from "./TranscriptItem";

export default function CompletedSidebar() {
  const { video, startTime, setStartTime, playerRef } = useVideoPageContext();
  const [isTranscriptActive, setIsTranscriptActive] = useState(true);

  if (video.status !== "completed" || !video.chapters) {
    return null;
  }

  const chapters = [...video.chapters];
  const transcript = [...video.transcript];

  chapters.sort((a, b) => a.offset - b.offset);
  transcript.sort((a, b) => a.offset - b.offset);

  const chapterMap = new Map<
    number,
    { title: string; offset: number; index: number }
  >();
  chapters.forEach((c, i) => {
    chapterMap.set(Math.floor(c.offset), {
      title: c.title,
      offset: Math.floor(c.offset),
      index: i,
    });
  });

  const seekTo = (secs: number) => {
    const p = playerRef.current;
    if (p && p.seekTo) {
      try {
        p.seekTo(secs, true);
      } catch {}
    }
  };

  const combined = "rounded-xl text-white px-4 py-2 w-full ";
  const active = "bg-green-700";
  const nonactive =
    "bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700";

  return (
    <div className="">
      <div className="flex flex-col xl:flex-row gap-2 mb-2">
        <button
          onClick={() => setIsTranscriptActive(true)}
          className={`${combined}${isTranscriptActive ? active : nonactive}`}
        >
          Transcripts
        </button>
        <button
          onClick={() => setIsTranscriptActive(false)}
          className={`${combined}${isTranscriptActive ? nonactive : active}`}
        >
          Chapters
        </button>
      </div>

      <>
        {isTranscriptActive && <TranscriptDisplay />}
        {!isTranscriptActive && <ChapterDisplay />}
      </>
    </div>
  );

  function TranscriptDisplay() {
    return (
      <div className="space-y-2 min-w-0">
        {transcript.map((transcriptItem) => {
          const flooredOffset = Math.floor(transcriptItem.offset);
          const maybeChapter = chapterMap.get(flooredOffset);

          let isChapterActive = false;
          if (maybeChapter) {
            const thisIdx = maybeChapter.index;
            const nextChapter = chapters[thisIdx + 1];
            const nextOffset = nextChapter
              ? Math.floor(nextChapter.offset)
              : Infinity;
            isChapterActive =
              startTime >= maybeChapter.offset && startTime < nextOffset;
          }

          return (
            <div key={crypto.randomUUID()}>
              {maybeChapter && (
                <button
                  onClick={() => seekTo(maybeChapter.offset)}
                  className={
                    "w-full text-left rounded-lg p-2 text-sm transition-colors duration-150 flex items-center gap-2 " +
                    (isChapterActive
                      ? "bg-green-100 text-green-900 font-semibold border-l-4 border-green-600 shadow-sm"
                      : "bg-green-50 text-green-800 hover:bg-green-100 border-l-4 border-green-300")
                  }
                >
                  <span className="truncate">{maybeChapter.title}</span>
                </button>
              )}

              <TranscriptItem
                key={crypto.randomUUID()}
                transcriptItem={transcriptItem}
                startTime={startTime}
                setStartTime={setStartTime}
                onSeek={(secs: number) => seekTo(secs)}
              />
            </div>
          );
        })}
      </div>
    );
  }

  function ChapterDisplay() {
    return (
      <div className="space-y-2 min-w-0">
        {chapters.map((chapter, i) => {
          const offset = Math.floor(chapter.offset);
          const next = chapters[i + 1];
          const nextOffset = next ? Math.floor(next.offset) : Infinity;
          const isChapterActive = startTime >= offset && startTime < nextOffset;

          return (
            <button
              key={`${offset}-${i}-${chapter.title}`}
              onClick={() => seekTo(offset)}
              className={
                "w-full text-left rounded-lg p-2 text-sm transition-colors duration-150 flex items-center gap-2 " +
                (isChapterActive
                  ? "bg-green-100 text-green-900 font-semibold border-l-4 border-green-600 shadow-sm"
                  : "bg-green-50 text-green-800 hover:bg-green-100 border-l-4 border-green-300")
              }
            >
              <span className="truncate">{chapter.title}</span>
            </button>
          );
        })}
      </div>
    );
  }
}
