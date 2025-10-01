"use client";

import { errorToast } from "@/utils/errorToast";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function HomePage() {
  const [url, setUrl] = useState("");

  return (
    <form
      onSubmit={handleUrlSubmit}
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
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          name="video"
          placeholder="https://www.youtube.com/"
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

  async function handleUrlSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!url) {
      errorToast("Missing url");
      setUrl("");
      return;
    }

    try {
      new URL(url);
    } catch {
      errorToast("Invalid url");
      setUrl("");
      return;
    }
  }
}
