import { useVideoPageContext } from "@/hooks/useVideoPageContext";

export default function Chapters() {
  const { video, startTime, playerRef } = useVideoPageContext();

  if (!video.chapters) {
    return <div>No chapters available.</div>;
  }

  const chapters = [...video.chapters];
  chapters.sort((a, b) => a.offset - b.offset);

  const seekTo = (secs: number) => {
    const p = playerRef.current;
    if (p && p.seekTo) {
      try {
        p.seekTo(secs, true);
      } catch {}
    }
  };

  return (
    <div className="space-y-2 min-w-0 flex-1 overflow-hidden">
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
              "w-full p-2 text-left rounded-lg text-sm transition-colors duration-150 flex items-center gap-2 " +
              (isChapterActive
                ? "bg-gray-800 font-semibold shadow-sm"
                : "bg-gray-700 hover:bg-gray-800")
            }
          >
            <span className="truncate">{chapter.title}</span>
          </button>
        );
      })}
    </div>
  );
}