"use client";

import { useVideoPageContext } from "@/hooks/useVideoPageContext";
import { api } from "@fasttute/backend/api";
import { errorToast } from "@/utils/errorToast";
import { SignInButton, SignUpButton, useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import ChatItem from "./ChatItem";
import { askQuestion, clearChat } from "../actions";

export default function Chat() {
  const { video, setStartTime, onSeek } = useVideoPageContext();

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
      <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded-lg p-4 flex justify-center items-center">
        <div className="flex flex-col gap-2">
          <p className="">You must be signed in to use AI chat</p>
          <div className="flex w-full gap-4 justify-center">
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-red-600 hover:cursor-pointer hover:bg-red-500 active:bg-red-700">
              <SignInButton />
            </div>
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-red-600 hover:cursor-pointer hover:bg-red-500 active:bg-red-700">
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
        className=" rounded-xl flex flex-col items-center justify-between gap-4"
      >
        <textarea
          value={question}
          onChange={handleInputChange}
          placeholder="Have questions about this video? Ask me!"
          className="w-full h-32 md:h-auto py-2 px-4 bg-gray-800 rounded-xl"
          onKeyDown={(e) => {
            if (e.key !== "Enter") {
              return;
            }

            if (e.shiftKey) {
              return;
            }

            e.preventDefault();
            handleValueSubmit(e);
          }}
        ></textarea>
        <button
          type="submit"
          disabled={isChatProcessing || isClearing}
          aria-busy={isChatProcessing || isClearing}
          className={`flex-shrink-0 h-12 w-full flex items-center justify-center rounded-lg bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed ${isChatProcessing ? "opacity-75 cursor-wait" : ""}`}
        >
          {isChatProcessing ? (
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

      <div className="w-full flex justify-center mb-4">
        {chat.length > 0 && (
          <button
            onClick={clearChatHandler}
            disabled={isChatProcessing || isClearing}
            aria-busy={isChatProcessing || isClearing}
            className={`flex-shrink-0 h-12 w-40 flex items-center justify-center rounded-lg bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed ${isClearing ? "opacity-75 cursor-wait" : ""}`}
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
    if (!question) {
      errorToast("No question asked", "No question asked");
      return;
    }

    const copiedQuestion = question.toString();
    setQuestion("");

    setIsChatProcessing(true);
    const { error } = await askQuestion(
      copiedQuestion,
      userId!,
      video._id,
      video.transcript,
    );

    setIsChatProcessing(false);
    if (error) {
      errorToast(error);
      return;
    }
  }

  async function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(e.target.value);
  }
}
