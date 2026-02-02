import { Dispatch, SetStateAction } from "react";
import { TIME_DIFF } from "./TranscriptItem";

type ChatItemProps = {
  item: { text: string; role: "User" | "Model" };
  setStartTime: Dispatch<SetStateAction<number>>;
  onSeek?: (secs: number) => void;
};

export default function ChatItem({
  item,
  setStartTime,
  onSeek,
}: ChatItemProps) {
  const { text, role } = item;

  if (role === "User") {
    return (
      <div className="w-full">
        <p className="text-gray-200">{text}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-red-100">{renderTextWithOffsets(text)}</p>
    </div>
  );

  function renderTextWithOffsets(input: string) {
    const regex = /\[\[(\d+)\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(input)) !== null) {
      const offset = Number(match[1]);
      const seconds = Math.floor(offset % TIME_DIFF);
      const minutes = Math.floor(offset / TIME_DIFF) % TIME_DIFF;
      const hours = Math.floor(offset / (TIME_DIFF * TIME_DIFF));

      const secondsStr = String(seconds).padStart(2, "0");
      const minutesStr = String(minutes).padStart(2, "0");

      if (match.index > lastIndex) {
        parts.push(input.slice(lastIndex, match.index));
      }

      parts.push(
        <span
          key={key++}
          className="font-mono cursor-pointer text-blue-300 hover:underline"
          onClick={() => {
            if (typeof onSeek === "function") {
              onSeek(offset);
            } else {
              setStartTime(offset);
            }
          }}
          title={`Jump to ${offset} seconds`}
        >
          ({hours > 0 && `${hours}:`}
          {minutesStr}:{secondsStr})
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < input.length) {
      parts.push(input.slice(lastIndex));
    }

    return parts;
  }
}
