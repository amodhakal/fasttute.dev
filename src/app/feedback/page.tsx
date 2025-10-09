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
    <div className="min-h-screen w-screen flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-xl shadow bg-gray-50 flex flex-col items-center gap-4"
      >
        <div className="w-full flex flex-col items-center">
          <h1 className="text-2xl font-black">Submit feedback</h1>
          <p className="text-sm">
            We will use this feedback to improve the product.
          </p>
        </div>

        <div className="flex flex-col justify-start w-full gap-2">
          <label htmlFor="feedback">Enter your feedback: </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            name="feedback"
            placeholder="Feedback here"
            className="h-48 rounded-xl p-2 border border-gray-200"
          ></textarea>
        </div>

        <button
          type="submit"
          className="rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700"
        >
          Submit
        </button>

        <div className="w-full flex flex-row-reverse text-green-500 hover:cursor-pointer hover:text-green-400 active:text-green-600">
          <Link href="/" className="underline">
            Go back
          </Link>
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
