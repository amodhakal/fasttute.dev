import { Doc } from "@/server/_generated/dataModel";
import {
  Content,
  GenerateContentConfig,
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

export function aiQnAHandler(
  previousChat: Doc<"video_chat">["chat"],
  transcript: Doc<"video_info">["transcript"]
) {
  const { model, config, getContents } = geminiConfig;

  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    throw new Error("Missing GEMINI_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });
  const generator = ai.models.generateContentStream({
    model,
    config,
    contents: getContents(transcript, previousChat),
  });

  return generator;
}

export const geminiConfig = {
  model: "gemini-2.5-pro",
  config: {
    temperature: 0,
    thinkingConfig: {
      thinkingBudget: -1,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, // Block most
      },
    ],
    systemInstruction: [
      {
        text: `You are an expert software engineering mentor. Your task is to answer a student's question based *primarily* on the 
        provided video transcript.

        RULES:
        1.  Your answer must be concise and directly address the student's question.
        2.  Your answer must be in plain text. Do NOT use any special formatting like Markdown (no **). You can include new lines, spaces, 
            and "-" for bullet points.

        3.  If your answer uses information from the transcript, you MUST cite the relevant section's offset.
        4.  The citation format is STRICTLY [[OFFSET IN SECONDS]]. For example: "You need to install Xcode [[124]]."
        5.  If multiple transcript sections are relevant, cite them all. For example: "First, do this [[124]], and then do that [[135]]."
        6.  Do NOT answer questions that are not closely related to the provided transcript. If the question is off-topic, 
            respond with: "I can only answer questions about the video."`,
      },
    ],
  } satisfies GenerateContentConfig,
  getContents: (
    transcript: Doc<"video_info">["transcript"],
    previousChat: Doc<"video_chat">["chat"]
  ): Content[] => {
    const formattedTranscript = transcript
      .map((item) => `[[${item.offset}]] ${item.text}`)
      .join("\n");

    const chatHistory: Content[] = previousChat.map((chatItem) => ({
      role: chatItem.role.toLowerCase() as "user" | "model",
      parts: [{ text: chatItem.text }],
    }));

    const lastUserQuestion = chatHistory.pop();
    if (!lastUserQuestion || lastUserQuestion.role !== "user") {
      throw new Error(
        "The last item in the chat history must be the user's question."
      );
    }

    const contents: Content[] = [
      {
        role: "user",
        parts: [
          {
            text: `Here is the full video transcript. Use this to answer my final question:\n\nTRANSCRIPT:\n"""\n${formattedTranscript}\n"""`,
          },
        ],
      },

      {
        role: "model",
        parts: [
          {
            text: "Understood. I have the transcript. I am ready to answer the user's question based on it.",
          },
        ],
      },
      ...chatHistory,
      lastUserQuestion,
    ];

    return contents;
  },
};
