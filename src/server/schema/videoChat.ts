import { defineTable } from "convex/server";
import { v, Infer } from "convex/values";

export const vRoles = () => v.union(v.literal("User"), v.literal("Model"));

export const vChat = () =>
  v.object({
    id: v.string(),
    role: vRoles(),
    text: v.string(),
  });

export type Chat = Infer<ReturnType<typeof vChat>>;

export const videoChat = defineTable({
  videoId: v.id("video_info"),
  userId: v.string(),
  chat: v.array(vChat()),
});
