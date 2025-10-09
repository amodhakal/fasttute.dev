"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/clerk-react";
import { FormEvent, useState } from "react";
import askQuestion from "./askQuestion";
import { Doc } from "@/server/_generated/dataModel";
import { errorToast } from "@/utils/errorToast";
import { useQuery } from "convex/react";
import { api } from "@/server/_generated/api";

export default function Chat({ video }: { video: Doc<"video_info"> }) {
  const { isSignedIn, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const chats = useQuery(api.videoChat.getChatsByVideoAndUserId, {
    videoId: video._id,
    userId: userId || "Not received",
  })?.map((item) => item.chat);

  console.log(chats);

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
        disabled={isLoading}
        aria-busy={isLoading}
        className={`rounded-xl rounded-l-none text-white h-14 w-3xs bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700 ${isLoading ? "opacity-75 cursor-wait" : ""}`}
      >
        {isLoading ? (
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
  );

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    const copiedQuestion = question.toString();
    setQuestion("");

    setIsLoading(true);
    const { error } = await askQuestion(
      copiedQuestion,
      userId!,
      video._id,
      video.transcript
    );

    setIsLoading(false);
    if (error) {
      errorToast(error);
      return;
    }
  }
}
