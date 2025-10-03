import { api } from "@/server/_generated/api";
import type { Doc } from "@/server/_generated/dataModel";
import { GenerateContentConfig, GoogleGenAI } from "@google/genai";
import { fetchMutation } from "convex/nextjs";

export async function aiVideoProcessingHandler(video: Doc<"video_info">) {
  const { model, config, getContents } = geminiConfig;
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    throw new Error("Missing GEMINI_KEY");
  }

  console.log(`Processing video: ${video._id}`);
  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const response = await ai.models.generateContent({
    model,
    config,
    contents: getContents(JSON.stringify(video.transcript)),
  });
  console.log(`Processed video: ${video._id}`);

  if (!response.text) {
    throw new Error("Missing response");
  }

  const chapters = JSON.parse(response.text);

  await fetchMutation(api.videoInfo.updateWithNewValues, {
    chapters,
    id: video._id,
    status: "completed",
  });
}

export const geminiConfig = {
  model: "gemini-2.5-flash-lite",
  config: {
    temperature: 0,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["title", "offset"],
        properties: {
          title: { type: "string" },
          offset: { type: "number" },
        },
      },
    },
    systemInstruction: [
      {
        text: `You are a highly intelligent text processing engine. 
        Your task is to take a raw video transcript, which is a JSON 
        array of text segments with offsets, and perform two actions:
          1. **Generate Chapters:** Create a detailed, granular table of contents 
          based on the content. The chapter titles should be concise and descriptive.

            **RULES FOR "chapters":**
            - It must be a JSON array of objects.
            - Each object must have two keys: "title" (a string) and "offset" (a number 
              in seconds). The offset MUST be the one of the offsets in the transcript.
            - Ignore non-technical fluff like intros and outros. Focus on the core content.
            - Aim for a new chapter every 1-3 minutes of dense technical content.`,
      },
    ],
  } satisfies GenerateContentConfig,
  getContents: (transcriptString: string) => [
    {
      role: "user",
      parts: [
        {
          text: `Process the following raw transcript and provide the output in the exact JSON 
          format specified above. RAW TRANSCRIPT: """
            ${transcriptString}
          """`,
        },
      ],
    },
  ],
};
