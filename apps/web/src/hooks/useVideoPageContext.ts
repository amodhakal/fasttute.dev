import { YTPlayer } from "@/hooks/useYoutubePlayer";
import { Doc } from "@fasttute/backend/api";
import {
  createContext,
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
} from "react";

export interface VideoPageContextType {
  video: Doc<"video_info">;
  startTime: number;
  setStartTime: Dispatch<SetStateAction<number>>;
  playerRef: RefObject<YTPlayer | null>;
  onSeek: (secs: number) => void;
}

export const VideoPageContext = createContext<VideoPageContextType | null>(
  null,
);

export function useVideoPageContext() {
  const context = useContext(VideoPageContext);
  if (!context) {
    throw new Error("useVideoPageContext not within VideoPageProvider");
  }

  return context;
}
