import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY || "";
    const siteUrl = process.env.SITE_URL || ""; // Optional
    const siteName = process.env.SITE_NAME || ""; // Optional

    const messages = history.map((msg) => ({
      role: msg.role,
      content: [{ type: "text", text: msg.content }],
    }));

    messages.push({
      role: "user",
      content: [{ type: "text", text: message }],
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-thinking-exp-1219:free",
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.[0]?.text || "No response generated.";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
