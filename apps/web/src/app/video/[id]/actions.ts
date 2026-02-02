"use server";

import { api } from "@fasttute/backend/api";
import { fetchAction, fetchMutation } from "convex/nextjs";

export async function askQuestion(
  question: string,
  userId: string,
  videoId: any,
  transcript: any,
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

export async function clearChat(userId: string, videoId: any) {
  try {
    await fetchMutation(api.videoChat.deleteChat, { videoId, userId });
    return { error: null };
  } catch (err) {
    console.error(err);
    return { error: "An error occured" };
  }
}
