import { defineSchema } from "convex/server";
import { videoInfo } from "./schema/videoInfo";
import { videoChat } from "./schema/videoChat";
import { feedback } from "./schema/feedback";

export default defineSchema({
  video_info: videoInfo,
  video_chat: videoChat,
  feedback: feedback,
});
