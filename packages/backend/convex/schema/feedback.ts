import { defineTable } from "convex/server";
import { v } from "convex/values";

export const feedback = defineTable({
  userId: v.string(),
  feedback: v.string(),
});
