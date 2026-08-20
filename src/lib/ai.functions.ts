import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "google/gemini-2.5-flash";

const InputSchema = z.object({
  tool: z.enum(["meeting", "email", "research"]),
  payload: z.record(z.string(), z.string()),
});

const PROMPTS: Record<string, { system: string; shape: string }> = {
  meeting: {
    system:
      "You are a precise meeting-notes analyst for a workplace productivity tool. Only use information present in the notes. Never invent attendees, decisions or dates. If a section has nothing, return an empty array.",
    shape: `{"summary": string, "keyPoints": string[], "keyDecisions": string[], "actionItems": [{"task": string, "owner": string, "due": string}], "deadlines": string[], "followUps": string[]}`,
  },
  email: {
    system:
      "You are an expert business email writer. Produce polished, ready-to-edit drafts. Never fabricate facts, figures or commitments beyond what the user provided. Use a placeholder like [Name] when details are unknown.",
    shape: `{"subject": string, "body": string}`,
  },
  research: {
    system:
      "You are a research assistant for professionals. Clearly separate what the user supplied from your own suggestions. Never state unverified claims as fact — hedge and flag anything that needs independent verification.",
    shape: `{"researchQuestion": string, "subQuestions": string[], "keyFindings": string[], "mainThemes": string[], "insights": string[], "questionsToExplore": string[], "verificationNotes": string[]}`,
  },
};

function buildUserPrompt(tool: string, payload: Record<string, string>) {
  const entries = Object.entries(payload)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}:\n${v}`)
    .join("\n\n");
  return `${entries}\n\nRespond with JSON only, matching this shape exactly:\n${PROMPTS[tool]!.shape}`;
}

export const generateWithAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this workspace.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PROMPTS[data.tool]!.system },
          { role: "user", content: buildUserPrompt(data.tool, data.payload) },
        ],
      }),
    });

    if (res.status === 429) {
      throw new Error("Too many requests right now. Please wait a moment and try again.");
    }
    if (res.status === 402) {
      throw new Error("AI credits have run out. Add credits in your Lovable workspace to continue.");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI request failed (${res.status}). ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(cleaned) as Record<string, unknown>;
    } catch {
      throw new Error("The AI returned an unexpected response. Please try generating again.");
    }
  });