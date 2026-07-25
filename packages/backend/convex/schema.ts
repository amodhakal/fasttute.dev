import { defineSchema } from "convex/server";
import { videoInfo } from "./schema/videoInfo";
import { videoChat } from "./schema/videoChat";
import { feedback } from "./schema/feedback";
import { videoFocus } from "./schema/focus";
import { transcriptChunks } from "./schema/transcriptChunks";

export default defineSchema({
  video_info: videoInfo,
  video_chat: videoChat,
  feedback: feedback,
  video_focus: videoFocus,
  transcript_chunks: transcriptChunks,
});
