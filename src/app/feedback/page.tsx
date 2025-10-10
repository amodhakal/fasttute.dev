"use client";

import { errorToast } from "@/utils/errorToast";
import { useAuth } from "@clerk/clerk-react";
import { FormEvent, useState } from "react";
import submitFeedback from "./actions";
import toast from "react-hot-toast";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function FeedbackPage() {
  const { userId, isSignedIn } = useAuth();
  const [feedback, setFeedback] = useState("");

  if (!userId || !isSignedIn) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen w-screen flex justify-center items-center text-white">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-2xl shadow-2xl bg-gray-900 border border-gray-700 flex flex-col items-center gap-6 w-11/12 max-w-md"
      >
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-red-500 text-center">Submit Feedback</h1>
          <p className="text-gray-400 text-center text-sm sm:text-base">Your feedback helps us improve our product.</p>
        </div>

        <div className="flex flex-col justify-start w-full gap-4">
          <label htmlFor="feedback" className="text-gray-400 text-sm sm:text-base">Enter Feedback:</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            name="feedback"
            placeholder="Write your feedback here..."
            className="h-24 sm:h-32 rounded-lg p-4 border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
          ></textarea>
        </div>

        <button
          type="submit"
          className="flex-shrink-0 h-10 sm:h-12 w-full flex items-center justify-center rounded-lg bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed shadow-lg"
        >
          Submit
        </button>

        <div className="w-full flex flex-row-reverse text-red-500 hover:cursor-pointer hover:text-red-400 active:text-red-600 text-sm sm:text-base">
          <Link href="/" className="underline">Go back</Link>
        </div>
      </form>
    </div>
  );

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();

    if (!feedback) {
      errorToast("Missing feedback");
      return;
    }

    await submitFeedback(userId!, feedback);
    toast("Feedback submitted");
  }
}
