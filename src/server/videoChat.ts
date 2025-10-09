// export default async function askQuestion(
//   question: string,
//   userId: string,
//   videoId: Doc<"video_info">["_id"],
//   transcript: Doc<"video_info">["transcript"]
// ) {
//   try {
//     // TODO
//     return { error: null };
//   } catch (err) {
//     console.error(err);
//     return { error: "An error occured" };
//   }
// }

import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { vTranscript } from "./schema/videoInfo";
import { api } from "./_generated/api";

export const handleAskedQuestion = action({
  args: {
    question: v.string(),
    userId: v.string(),
    videoId: v.id("video_info"),
    transcript: vTranscript(),
  },
  handler: async (ctx, { question, userId, videoId, transcript }) => {
    let chatId = await ctx.runQuery(api.videoChat.getChatIdByVideoAndUserId, {
      userId,
      videoId,
    });

    if (!chatId) {
      chatId = await ctx.runMutation(api.videoChat.createNewChat, {
        userId,
        videoId,
      });
    }

    
    // TODO
  },
});

export const getChatIdByVideoAndUserId = query({
  args: {
    userId: v.string(),
    videoId: v.id("video_info"),
  },
  handler: async (ctx, { userId, videoId }) => {
    const foundChat = await ctx.db
      .query("video_chat")
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("videoId"), videoId))
      .first();

    return foundChat?._id;

    // TODO
  },
});

export const createNewChat = mutation({
  args: {
    userId: v.string(),
    videoId: v.id("video_info"),
  },
  handler: async (ctx, { userId, videoId }) => {
    const newChatId = await ctx.db.insert("video_chat", {
      videoId,
      userId,
      chat: [],
    });
    return newChatId;
  },
});
