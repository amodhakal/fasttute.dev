import { GoogleGenAI, GenerateContentConfig } from "@google/genai";

export type SkipSegment = {
  startOffset: number;
  endOffset: number;
  reason: string;
};

const FOCUS_SYSTEM_INSTRUCTION = `You are an intelligent video analysis engine.
Your task is to analyze a video transcript and identify segments that can be safely skipped without losing important content.

IMPORTANT: Be CONSERVATIVE. Only mark segments as skippable if they are clearly filler, repetitive, or irrelevant.
Most of the video content should NOT be marked as skippable.

Identify the following types of skippable segments:
1. **Sponsor/Ad segments**: "This video is sponsored by...", "Thanks to [brand] for sponsoring..."
2. **Intros/Outros**: "Thanks for watching", "Like and subscribe", channel promotions
3. **Repetitive content the same thing**: When is explained multiple times
4. **Tangents**: Extended off-topic discussions
5. **Dead air/Filler**: Long pauses, "umm", "uhh", technical difficulties
6. **Recaps/Reviews**: Lengthy summaries of what was just covered (short 1-2 sentence recaps are fine)

RULES:
- Return a JSON array of skippable segments.
- Each segment MUST have: startOffset (seconds), endOffset (seconds), reason (string).
- startOffset must be LESS than endOffset.
- If NO segments are skippable, return an EMPTY array [].
- Do NOT include any segment longer than 5 minutes.
- Do NOT mark more than 30% of the video as skippable.
- Only use offsets that exist in the transcript.
- Be extremely conservative - it's better to NOT skip than to skip important content.`;

export async function generateFocusSegments(
  transcript: Array<{ text: string; offset: number; duration: number }>,
): Promise<SkipSegment[]> {
  const GEMINI_KEY = process.env.GEMINI_KEY;
  if (!GEMINI_KEY) {
    throw new Error("Missing GEMINI_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

  const config: GenerateContentConfig = {
    temperature: 0,
    responseMimeType: "application/json",
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseSchema: {
      type: "array",
      items: {
        type: "object",
        required: ["startOffset", "endOffset", "reason"],
        properties: {
          startOffset: { type: "number" },
          endOffset: { type: "number" },
          reason: { type: "string" },
        },
      },
    },
    systemInstruction: [{ text: FOCUS_SYSTEM_INSTRUCTION }],
  };

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Analyze this transcript and identify skippable segments. Return ONLY a JSON array.
RAW TRANSCRIPT: """
${JSON.stringify(transcript)}
"""`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config,
    contents,
  });

  if (!response.text) {
    return [];
  }

  try {
    const segments = JSON.parse(response.text);
    return Array.isArray(segments) ? segments : [];
  } catch {
    return [];
  }
}
