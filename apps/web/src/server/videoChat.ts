import { aiQnAHandler } from "@/utils/ai/qna";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";
import { Chat, vRoles } from "./schema/videoChat";
import { vTranscript } from "./schema/videoInfo";

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

    const newQuestion: Chat = {
      id: crypto.randomUUID(),
      role: "User",
      text: question,
    };

    await ctx.runMutation(api.videoChat.insertIntoChat, {
      chatId,
      ...newQuestion,
    });

    const chatHistoryForAI = chatLength === 0 ? [] : foundChats[0].chat;

    chatHistoryForAI.push(newQuestion);

    const newAnswer: Chat = {
      id: crypto.randomUUID(),
      role: "Model",
      text: "",
    };

    await ctx.runMutation(api.videoChat.insertIntoChat, {
      chatId,
      ...newAnswer,
    });

    const generator = await aiQnAHandler(chatHistoryForAI, transcript);
    for await (const chunk of generator) {
      await ctx.runMutation(api.videoChat.pushChunkToModelChat, {
        chatId,
        responseId: newAnswer.id,
        chunk: chunk.text,
      });
    }
  },
});

export const pushChunkToModelChat = mutation({
  args: {
    chatId: v.id("video_chat"),
    responseId: v.string(),
    chunk: v.optional(v.string()),
  },
  handler: async (ctx, { chatId, responseId, chunk }) => {
    if (!chunk) {
      return;
    }

    const chat = await ctx.runQuery(api.videoChat.getChatById, { chatId });
    if (!chat) {
      throw new Error(`Received chat id: ${chatId} with no chat`);
    }

    const previousMessage = chat.chat;
    const currentModelMessage = previousMessage.pop();

    if (!currentModelMessage) {
      throw new Error(
        `Received chat id: ${chatId} has no current model message`
      );
    }

    if (currentModelMessage.role !== "Model") {
      throw new Error(`Received chat id: ${chatId} has current user message`);
    }

    if (currentModelMessage.id !== responseId) {
      throw new Error(
        `Received chat id: ${chatId} has unequal response id and current model message id`
      );
    }

    const updatedChat = [
      ...previousMessage,
      {
        id: currentModelMessage.id,
        role: currentModelMessage.role,
        text: currentModelMessage.text + chunk,
      },
    ];

    await ctx.db.patch(chatId, { chat: updatedChat });
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
    id: v.string(),
    role: vRoles(),
    text: v.string(),
  },
  handler: async (ctx, { chatId, id, role, text }) => {
    const foundChat = await ctx.runQuery(api.videoChat.getChatById, { chatId });
    if (!foundChat) {
      throw new Error(`Chat ${chatId} must have existing chat`);
    }

    foundChat.chat.push({ id, role, text });
    await ctx.db.patch(chatId, { chat: foundChat.chat });
  },
});

export const deleteChat = mutation({
  args: {
    userId: v.string(),
    videoId: v.id("video_info"),
  },
  handler: async (ctx, { userId, videoId }) => {
    const chats = await ctx.runQuery(api.videoChat.getChatsByVideoAndUserId, {
      userId,
      videoId,
    });

    for (const chat of chats) {
      await ctx.db.delete(chat._id);
    }
  },
});
