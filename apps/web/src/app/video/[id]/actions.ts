"use server";

import { api } from "@/server/_generated/api";
import { Doc } from "@/server/_generated/dataModel";
import { fetchAction, fetchMutation } from "convex/nextjs";

export async function askQuestion(
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

export async function clearChat(
  userId: string,
  videoId: Doc<"video_info">["_id"]
) {
  try {
    await fetchMutation(api.videoChat.deleteChat, { videoId, userId });
    return { error: null };
  } catch (err) {
    console.error(err);
    return { error: "An error occured" };
  }
}
