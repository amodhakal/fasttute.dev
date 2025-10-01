"use client";

/** Use http://youtube.com/watch?v=0-S5a0eXPoc for testing  */

import { api } from "@/server/_generated/api";
import { errorToast } from "@/utils/errorToast";
import { useAction } from "convex/react";
import { redirect, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function HomePage() {
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("value") || "");
  const [isLoading, setIsLoading] = useState(false);
  const retrieveVideoInfo = useAction(api.actions.retrieveVideoInfo);

  return (
    <form
      onSubmit={handleValueSubmit}
      className="w-screen min-h-screen flex justify-center items-center"
    >
      <div className="flex flex-col gap-4">
        <label
          htmlFor="video"
          className="font-black flex justify-center text-2xl"
        >
          Stop scrubbing. Start learning.
        </label>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          name="video"
          placeholder="Enter the url or the id of your video"
          className="rounded-xl border border-gray-400 px-4 py-2 w-md"
        />
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className={`rounded-xl text-white px-4 py-2 w-md bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700 ${isLoading ? "opacity-75 cursor-wait" : ""}`}
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
            "Submit"
          )}
        </button>
      </div>
    </form>
  );

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    setIsLoading(true);
    const { error, id } = await retrieveVideoInfo({ youtubeUrlOrId: value });
    setIsLoading(false);

    if (error) {
      errorToast(error);
      setValue("");
      return;
    }

    redirect(`/video/${id}`);
  }
}
