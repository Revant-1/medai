import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { messages } = await req.json();
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`, // Use a server-side key
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-thinking-exp-1219:free",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API request failed");
    }

    return NextResponse.json({ response: data.choices?.[0]?.message?.content });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
