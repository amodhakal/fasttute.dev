"use server";

import { api } from "@fasttute/backend/api";
import { fetchMutation } from "convex/nextjs";

export default async function submitFeedback(userId: string, feedback: string) {
  await fetchMutation(api.feedback.insertFeedback, { userId, feedback });
}
