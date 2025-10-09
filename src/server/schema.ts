import { defineSchema } from "convex/server";
import { videoChat } from "./schema/videoChat";
import { videoInfo } from "./schema/videoInfo";

export default defineSchema({
  video_info: videoInfo,
  video_chat: videoChat,
});
