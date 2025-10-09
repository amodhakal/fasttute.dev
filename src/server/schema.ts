import { defineSchema } from "convex/server";
import { videoChat } from "./schema/videoChat";
import { videoInfo } from "./schema/videoInfo";
import { feedback } from "./schema/feedback";

export default defineSchema({
  feedback,
  video_info: videoInfo,
  video_chat: videoChat,
});
