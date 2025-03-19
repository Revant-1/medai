import { NextResponse } from "next/server";

async function callOpenRouterAPI(messages, retryCount = 0) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || '',
        "X-Title": "MediSage",
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

    return data;
  } catch (error) {
    if (retryCount < 4) { // Max 5 attempts (0-4)
      console.log(`Retry attempt ${retryCount + 1} for OpenRouter API`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      return callOpenRouterAPI(messages, retryCount + 1);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  try {
    const { messages, userId, chatId } = await req.json();
    
    const data = await callOpenRouterAPI(messages);
    
    // If we have a userId and chatId, save the chat history
    if (userId && chatId) {
      try {
        const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/chat-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            chatId,
            messages: [
              ...messages,
              {
                role: "assistant",
                content: data.choices[0].message.content,
              },
            ],
          }),
        });
        
        if (!historyResponse.ok) {
          console.error("Failed to save chat history");
        }
      } catch (historyError) {
        console.error("Error saving chat history:", historyError);
      }
    }

    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
