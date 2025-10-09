"use server";

import { api } from "@/server/_generated/api";
import { Doc } from "@/server/_generated/dataModel";
import { fetchAction } from "convex/nextjs";

export default async function askQuestion(
  question: string,
  userId: string,
  videoId: Doc<"video_info">["_id"],
  transcript: Doc<"video_info">["transcript"]
) {
  try {
    await fetchAction(api.videoChat.handleAskedQuestion, {
      question,
      userId,
      videoId,
      transcript,
    });

    return { error: null };
  } catch (err) {
    console.error(err);
    return { error: "An error occured" };
  }
}
