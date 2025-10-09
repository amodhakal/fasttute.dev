"use client";

import { api } from "@/server/_generated/api";
import { Doc } from "@/server/_generated/dataModel";
import { errorToast } from "@/utils/errorToast";
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import ChatItem from "./ChatItem";
import { askQuestion, clearChat } from "./actions";

export default function Chat({
  video,
  setStartTime,
  onSeek,
}: {
  video: Doc<"video_info">;
  setStartTime: Dispatch<SetStateAction<number>>;
  onSeek?: (secs: number) => void;
}) {
  const { isSignedIn, userId } = useAuth();
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const [question, setQuestion] = useState("");
  const allChats = useQuery(api.videoChat.getChatsByVideoAndUserId, {
    videoId: video._id,
    userId: userId || "Not received",
  });

  console.log(allChats);
  const chat =
    allChats && allChats?.length > 0
      ? allChats[0].chat.map((item) => item)
      : [];

  if (!isSignedIn) {
    return (
      <div className="bg-gray-800 text-gray-100 rounded-lg p-4 flex justify-center items-center">
        <div className="flex flex-col gap-2">
          <p className="">You must be signed in to use AI chat</p>
          <div className="flex w-full gap-4 justify-center">
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700">
              <SignInButton />
            </div>
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700">
              <SignUpButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <form
        onSubmit={handleValueSubmit}
        className="bg-gray-800 text-gray-100 rounded-xl flex items-center justify-between gap-4 h-14"
      >
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Have questions about this video? Ask me!"
          className="w-full h-14 py-1.5 px-4 text-gray-100 rounded-xl rounded-r-none"
        ></textarea>
        <button
          type="submit"
          disabled={isChatProcessing || isClearing}
          aria-busy={isChatProcessing || isClearing}
          className={`rounded-xl rounded-l-none text-white h-14 w-3xs bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700 disabled:bg-green-700 disabled:cursor-auto ${isChatProcessing ? "opacity-75 cursor-wait" : ""}`}
        >
          {isChatProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Ask"
          )}
        </button>
      </form>

      {chat.length > 0 && (
        <div className="p-4 bg-gray-800 text-gray-100 rounded-xl gap-2 flex flex-col">
          {chat.map((item) => (
            <ChatItem
              key={item.id}
              item={item}
              setStartTime={setStartTime}
              onSeek={onSeek}
            />
          ))}
        </div>
      )}

      <div className="w-full flex justify-center">
        {chat.length > 0 && (
          <button
            onClick={clearChatHandler}
            disabled={isChatProcessing || isClearing}
            aria-busy={isChatProcessing || isClearing}
            className={`rounded-xl text-white py-4 w-3xs bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700 disabled:bg-green-700 disabled:cursor-auto ${isChatProcessing ? "opacity-75 cursor-wait" : ""}`}
          >
            {isClearing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Clearing...
              </span>
            ) : (
              "Clear chat"
            )}
          </button>
        )}
      </div>
    </div>
  );

  async function clearChatHandler() {
    setIsClearing(true);
    const { error } = await clearChat(userId!, video._id);

    setIsClearing(false);
    if (error) {
      errorToast(error);
      return;
    }
  }

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    const copiedQuestion = question.toString();
    setQuestion("");

    setIsChatProcessing(true);
    const { error } = await askQuestion(
      copiedQuestion,
      userId!,
      video._id,
      video.transcript
    );

    setIsChatProcessing(false);
    if (error) {
      errorToast(error);
      return;
    }
  }
}
