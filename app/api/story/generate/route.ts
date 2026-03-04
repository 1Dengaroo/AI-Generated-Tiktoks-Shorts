import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/api/openai";
import { storyGenerateRequestSchema } from "@/lib/story/story-schema";
import { buildStorySystemPrompt } from "@/lib/story/story-prompt";
import { getErrorMessage } from "@/lib/utils";
import type { StoryGenerateResponse } from "@/lib/story/story.types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = storyGenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { prompt, tone = "dramatic" } = parsed.data;

    const targetWordCount = 450;

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: buildStorySystemPrompt({ targetWordCount, tone }),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 },
      );
    }

    const story = JSON.parse(content);

    return NextResponse.json({ story } satisfies StoryGenerateResponse);
  } catch (err) {
    console.error("Story generation error:", err);
    return NextResponse.json(
      { error: getErrorMessage(err, "Story generation failed") },
      { status: 500 },
    );
  }
}
