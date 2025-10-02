import type { Doc } from "@/server/_generated/dataModel";
import { GenerateContentConfig, GoogleGenAI } from "@google/genai";

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

  //   if (!response.text) {
  //     console.error(response);
  //     throw new Error("Missing response");
  //   }

  // TODO Enter the chapters and the fixed transcripts with status of completed
  // TODO Let the frontend know somehow that it is available. DO the same if an error occurs as well

  console.log(response, response.text);
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
      type: "object",
      required: ["cleanedTranscript", "chapters"],
      properties: {
        cleanedTranscript: {
          type: "array",
          items: {
            type: "object",
            required: ["text", "startSec", "endSec"],
            properties: {
              text: { type: "string" },
              startSec: { type: "number" },
              endSec: { type: "number" },
            },
          },
        },
        chapters: {
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
      },
    },
    systemInstruction: [
      {
        text: `You are a highly intelligent text processing engine. 
        Your task is to take a raw video transcript, which is a JSON 
        array of text segments with offsets, and perform two actions:
          1. **Clean the Transcript:** Convert the raw text segments into 
          a clean, readable format. This means correcting capitalization, 
          adding punctuation (periods, commas, question marks), and combining 
          short, fragmented segments into coherent sentences.
          2. **Generate Chapters:** Create a detailed, granular table of contents 
          based on the content. The chapter titles should be concise and descriptive.

        The final output MUST be a single, valid JSON object with two top-level keys: 
        "cleanedTranscript" and "chapters".
           **RULES FOR "cleanedTranscript":**
           - It must be a JSON array of objects.
           - Each object must have three keys: "text" (the full, cleaned sentence), 
             "start" (the timestamp of the first word in the sentence), and "end" (the 
             timestamp of the last word).

            **RULES FOR "chapters":**
            - It must be a JSON array of objects.
            - Each object must have two keys: "title" (a string) and "timestamp" (a number 
              in seconds).
            - Ignore non-technical fluff like intros and outros. Focus on the core content.
            - Aim for a new chapter every 1-3 minutes of dense technical content.

            **EXAMPLE OUTPUT FORMAT:**
            {
              "cleanedTranscript": [
                { "text": "Hey everyone, today we're going to build a REST API.", "start": 1.5, "end": 4.7 },
                { "text": "First, let's open our terminal and create a new directory.", "start": 5.1, "end": 9.2 }
              ],
              "chapters": [
                { "title": "Project Initialization and Dependencies", "timestamp": 15.2 },
                { "title": "Creating the Main Express Server File", "timestamp": 65.8 }
              ]
            }`,
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
