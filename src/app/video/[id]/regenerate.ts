"use server";

import { api } from "@/server/_generated/api";
import { Doc } from "@/server/_generated/dataModel";
import { fetchAction } from "convex/nextjs";

export default async function regenerate(
  youtubeId: Doc<"video_info">["youtubeId"]
) {
  await fetchAction(api.actions.regenerate, { youtubeId });
}
