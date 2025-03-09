"use client"

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Paperclip, Send } from "lucide-react";

const HealthAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to MediSage! I'm your AI health assistant powered by OpenRouter. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const quickActions = [
    {
      icon: "🔍",
      title: "Review my MRI report",
      description: "and provide insights"
    },
    {
      icon: "👨‍⚕️",
      title: "Compare my blood test results",
      description: ""
    },
    {
      icon: "📋",
      title: "Analyze my symptoms:",
      description: "nausea, fatigue, loss of appetite"
    }
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-thinking-exp-1219:free",
          messages: [...messages, newMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;

      if (aiMessage) {
        setMessages((prev) => [...prev, { role: "assistant", content: aiMessage }]);
      } else {
        setError("No response from the AI assistant. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError("Error fetching AI response. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInput(action.title + " " + action.description);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Your Personal Health Assistant</h1>
        <p className="text-gray-600 mt-2">
          Powered by advanced AI to analyze, predict, and guide your health journey
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm min-h-[400px] mb-4 p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${
              msg.role === 'assistant' ? 'bg-gray-50 p-4 rounded-lg' : 'text-right'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="text-gray-500">Typing...</div>}
        {error && <div className="text-red-500">{error}</div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuickAction(action)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-2">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <p className="text-gray-800">{action.title}</p>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 border-0 focus:ring-0"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Camera size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Paperclip size={20} />
        </button>
        <button 
          className="p-2 bg-green-100 rounded-full text-green-600 hover:bg-green-200"
          onClick={handleSend}
          disabled={isLoading}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default HealthAssistant;