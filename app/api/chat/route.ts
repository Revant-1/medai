import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const { messages, userId, chatId } = await req.json()

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get current user
    const user = await getCurrentUser()
    const authenticatedUserId = user?.id || userId || "anonymous"

    // Format the messages for the OpenRouter API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      // Only include attachments if they exist
      ...(msg.attachments && { attachments: msg.attachments }),
    }))

    // Add medical context to the system message
    const systemMessage = {
      role: "system",
      content: `You are MediSage, an AI medical assistant. Provide helpful, accurate, and easy-to-understand information about medical topics. 
      Always clarify that you're not a doctor and your advice doesn't replace professional medical consultation.
      Focus on evidence-based information and be cautious about providing specific diagnoses.
      If asked about symptoms, explain possible causes but emphasize the importance of seeing a healthcare provider.
      For medications, explain general information about usage, common side effects, and important warnings.
      When discussing sensitive topics, be respectful and professional.
      If you don't know something or if the question is outside your medical knowledge, admit it and suggest consulting a healthcare professional.`,
    }

    // Check if any message has attachments
    const hasAttachments = formattedMessages.some((msg) => msg.attachments && msg.attachments.length > 0)

    // Prepare content for OpenRouter API
    const userMessage = formattedMessages[formattedMessages.length - 1]
    let userContent = userMessage.content || ""

    // If there are attachments, add them to the content
    if (hasAttachments && userMessage.attachments) {
      const attachmentDescriptions = userMessage.attachments
        .map((att) => {
          if (att.type === "image") {
            return `[Image attached: ${att.name}]`
          } else {
            return `[Document attached: ${att.name}]`
          }
        })
        .join("\n")

      userContent = `${userContent}\n\n${attachmentDescriptions}`
    }

    // Generate response using OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus:beta", // You can change this to any model supported by OpenRouter
        messages: [systemMessage, ...formattedMessages.slice(0, -1), { ...userMessage, content: userContent }],
      }),
    })

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.json()
      console.error("OpenRouter API error:", errorData)
      throw new Error("Failed to get response from OpenRouter")
    }

    const openRouterData = await openRouterResponse.json()
    const aiResponse = openRouterData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."

    // Connect to MongoDB using the environment variable
    const client = await clientPromise
    const db = client.db("medisage")

    // Save the conversation to the database
    const chatCollection = db.collection("chats")

    // Check if chat exists
    const chat = await chatCollection.findOne({ chatId })

    if (chat) {
      // Update existing chat
      await chatCollection.updateOne(
        { chatId },
        {
          $push: {
            messages: {
              $each: [
                {
                  role: "user",
                  content: userMessage.content,
                  attachments: userMessage.attachments,
                  timestamp: new Date(),
                },
                {
                  role: "assistant",
                  content: aiResponse,
                  timestamp: new Date(),
                },
              ],
            },
          },
          $set: { updatedAt: new Date() },
        },
      )
    } else {
      // Create new chat
      await chatCollection.insertOne({
        chatId,
        userId: authenticatedUserId,
        messages: [
          {
            role: "user",
            content: userMessage.content,
            attachments: userMessage.attachments,
            timestamp: new Date(),
          },
          {
            role: "assistant",
            content: aiResponse,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
