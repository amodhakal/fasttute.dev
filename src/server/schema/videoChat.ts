import { defineTable } from "convex/server";
import { v } from "convex/values";

export const vRoles = () => v.union(v.literal("User"), v.literal("Model"));

export const vChat = () =>
  v.object({
    role: vRoles(),
    text: v.string(),
  });

export const videoChat = defineTable({
  videoId: v.id("video_info"),
  userId: v.string(),
  chat: v.array(vChat()),
});
