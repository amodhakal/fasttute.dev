"use client";

// Use http://youtube.com/watch?v=0-S5a0eXPoc for testing

import { errorToast } from "@/utils/errorToast";
import { FormEvent, useState } from "react";
import { getVideoInformation } from "@/actions/transcripts";

export default function HomePage() {
  const [value, setValue] = useState("");

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
          className="rounded-xl text-white bg-green-600 px-4 py-2 w-md"
        >
          Submit
        </button>
      </div>
    </form>
  );

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    const res = await getVideoInformation(value);
    if (res?.error) {
      errorToast(res.error);
      setValue("");
      return;
    }

    // TODO Handle youtube url
  }
}
