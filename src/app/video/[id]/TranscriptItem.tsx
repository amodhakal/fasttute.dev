import { Dispatch, SetStateAction } from "react";

type TranscriptItemProps = {
  startTime: number;
  setStartTime: Dispatch<SetStateAction<number>>;
  onSeek?: (secs: number) => void;
  transcriptItem: {
    text: string;
    offset: number;
    duration: number;
  };
};

const TIME_DIFF = 60;

export default function TranscriptItem({
  transcriptItem,
  setStartTime,
  startTime,
  onSeek,
}: TranscriptItemProps) {
  const { offset, text, duration } = transcriptItem;
  if (offset === 0 || !text) {
    return null;
  }

  const flooredOffset = Math.floor(offset);
  const flooredDuration = Math.floor(duration);

  const seconds = Math.floor(offset % TIME_DIFF);
  const minutes = Math.floor(offset / TIME_DIFF) % TIME_DIFF;
  const hours = Math.floor(offset / (TIME_DIFF * TIME_DIFF));
  const currentTime = Math.floor(offset);

  const secondsStr = String(seconds).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");

  const sharedClasses =
    "text-black rounded-lg shadow p-2 text-left transition-colors duration-150 hover:bg-gray-200";
  const currentClasses = sharedClasses + " bg-gray-200";
  const notCurrentClasses =
    sharedClasses + " bg-gray-50 hover:cursor-pointer active:bg-gray-300";
  const isCurrent =
    startTime >= flooredOffset && startTime < flooredOffset + flooredDuration;

  return (
    <button
      onClick={() => {
        if (typeof onSeek === "function") {
          onSeek(currentTime);
        } else {
          setStartTime(currentTime);
        }
      }}
      disabled={isCurrent}
      className={isCurrent ? currentClasses : notCurrentClasses}
    >
      <p className="font-mono text-sm text-gray-600">
        {hours > 0 && `${hours}:`}
        {minutesStr}:{secondsStr}
      </p>
      <p className="mt-1">{transcriptItem.text}</p>
    </button>
  );
}
