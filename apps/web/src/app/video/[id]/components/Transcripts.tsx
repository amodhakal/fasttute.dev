"use client";

import { useVideoPageContext } from "@/hooks/useVideoPageContext";
import TranscriptItem from "./TranscriptItem";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@fasttute/backend/api";

export default function Transcripts() {
  const { video, startTime, setStartTime, playerRef } = useVideoPageContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);

  const searchTranscriptAction = useAction(api.transcriptSearch.searchTranscript);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !video?._id) return;
    setSearching(true);
    try {
      const results = await searchTranscriptAction({
        videoId: video._id,
        query: searchQuery.trim(),
      });
      setSearchResults(results);
    } catch (err) {
      console.error("Transcript RAG search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <div className="space-y-4 min-w-0">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Semantic search transcript (RAG)..."
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-red-500"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition-all cursor-pointer"
        >
          {searching ? "Searching..." : "Search"}
        </button>
        {searchResults !== null && (
          <button
            type="button"
            onClick={clearSearch}
            className="px-3 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-all cursor-pointer"
          >
            Clear
          </button>
        )}
      </form>

      {searchResults !== null ? (
        <div className="space-y-2">
          <div className="text-xs text-neutral-400 mb-2">
            Found {searchResults.length} relevant transcript segments:
          </div>
          {searchResults.length === 0 ? (
            <div className="text-sm text-neutral-400 py-4 text-center">
              No matching transcript segments found.
            </div>
          ) : (
            searchResults.map((result) => {
              const minutes = Math.floor(result.offset / 60);
              const seconds = Math.floor(result.offset % 60);
              const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;
              return (
                <div
                  key={result._id}
                  onClick={() => seekTo(result.offset)}
                  className={`p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all ${
                    Math.abs(startTime - result.offset) < 5
                      ? "border-red-500 bg-neutral-800"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-red-500">
                      {timeString}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Score: {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-neutral-200">{result.text}</p>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
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
      )}
    </div>
  );
}
