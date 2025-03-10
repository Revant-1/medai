export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use a server-side key
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

    res.status(200).json({ response: data.choices?.[0]?.message?.content });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
