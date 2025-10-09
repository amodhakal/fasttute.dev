import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { vTranscript } from "./schema/videoInfo";
import { api } from "./_generated/api";
import { vChat, vRoles } from "./schema/videoChat";

export const handleAskedQuestion = action({
  args: {
    question: v.string(),
    userId: v.string(),
    videoId: v.id("video_info"),
    transcript: vTranscript(),
  },
  handler: async (ctx, { question, userId, videoId, transcript }) => {
    const foundChats = await ctx.runQuery(
      api.videoChat.getChatsByVideoAndUserId,
      {
        userId,
        videoId,
      }
    );

    const chatLength = foundChats.length;
    if (chatLength > 1) {
      throw new Error(
        `Multiple chats: ${foundChats.map((item) => item._id)} for video: ${videoId}, user: ${userId}`
      );
    }

    const chatId =
      chatLength === 0
        ? await ctx.runMutation(api.videoChat.createNewChat, {
            userId,
            videoId,
          })
        : foundChats[0]._id;

    await ctx.runMutation(api.videoChat.insertIntoChat, {
      chatId,
      text: question,
      role: "User",
    });

    // TODO Ask AI for answer, and update it
  },
});

export const getChatsByVideoAndUserId = query({
  args: {
    userId: v.optional(v.string()),
    videoId: v.optional(v.id("video_info")),
  },
  handler: async (ctx, { userId, videoId }) => {
    const foundChats = ctx.db.query("video_chat");

    const foundChatsByUser =
      userId !== undefined
        ? foundChats.filter((q) => q.eq(q.field("userId"), userId))
        : foundChats;

    const foundChatsByVideo =
      videoId !== undefined
        ? foundChatsByUser.filter((q) => q.eq(q.field("videoId"), videoId))
        : foundChatsByUser;

    return await foundChatsByVideo.collect();
  },
});

export const getChatById = query({
  args: { chatId: v.id("video_chat") },
  handler: async (ctx, { chatId }) => {
    const chat = ctx.db
      .query("video_chat")
      .filter((q) => q.eq(q.field("_id"), chatId))
      .first();

    return chat;
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

export const insertIntoChat = mutation({
  args: {
    chatId: v.id("video_chat"),
    role: vRoles(),
    text: v.string(),
  },
  handler: async (ctx, { chatId, role, text }) => {
    const foundChat = await ctx.runQuery(api.videoChat.getChatById, { chatId });
    if (!foundChat) {
      throw new Error(`Chat ${chatId} must have existing chat`);
    }

    foundChat.chat.push({ role, text });
    await ctx.db.patch(chatId, { chat: foundChat.chat });
  },
});
