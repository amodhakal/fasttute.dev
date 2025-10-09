import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const insertFeedback = mutation({
  args: { userId: v.string(), feedback: v.string() },
  handler: async (ctx, { userId, feedback }) => {
    await ctx.db.insert("feedback", { userId, feedback });
  },
});
