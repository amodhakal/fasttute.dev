"use client";

/** Use http://youtube.com/watch?v=0-S5a0eXPoc for testing  */

import { api } from "@/server/_generated/api";
import { errorToast } from "@/utils/errorToast";
import { useAction } from "convex/react";
import { redirect } from "next/navigation";

import { FormEvent, useState } from "react";

export default function HomePage() {
  const [value, setValue] = useState("");
  const retrieveVideoInfo = useAction(api.videoInfo.retrieveVideoInfo);

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
          className="rounded-xl text-white px-4 py-2 w-md bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700"
        >
          Submit
        </button>
      </div>
    </form>
  );

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    const { error, id } = await retrieveVideoInfo({ youtubeUrlOrId: value });
    if (error) {
      errorToast(error);
      setValue("");
      return;
    }

    redirect(`/video/${id}`);
  }
}
