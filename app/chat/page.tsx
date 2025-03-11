"use client";

import React, { useState, useEffect } from "react";
import { User, Camera, Paperclip, Loader2, Send, Menu, FileText } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";

const MediSage = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "system",
      text: "Welcome to MediSage! I'm your AI health assistant powered by OpenRouter. How can I help you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(false);

  const examples = [
    { text: "Review my MRI report and provide insights", icon: "🔍" },
    { text: "Compare my blood test results", icon: "🩺" },
    { text: "Analyze my symptoms: nausea, fatigue, loss of appetite", icon: "📋" },
  ];

  // Fetch stored documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/list-files');
        const data = await response.json();
        if (data.success) {
          setDocuments(data.files);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  const sendMessage = async (documentUrl = null) => {
    if (!inputValue.trim() && !documentUrl) return;

    // Create user message
    const userMessage = { 
      sender: "user", 
      text: documentUrl 
        ? `Analyzing document: ${documentUrl.split('/').pop()}` 
        : inputValue 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowDocuments(false);

    try {
      // Prepare messages for API
      const messageHistory = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      // Prepare the content for the current message
      let currentContent;
      if (documentUrl) {
        // If sending a document, use multipart content with image_url
        currentContent = [
          {
            type: "text",
            text: "Given the following medical document, please analyze it and provide insights:"
          },
          {
            type: "image_url",
            image_url: { url: documentUrl }
          }
        ];
      } else {
        // If sending text only
        currentContent = inputValue;
      }

      // Add current message to history
      const payload = {
        model: "google/gemini-2.0-flash-thinking-exp-1219:free",
        messages: [
          ...messageHistory,
          { role: "user", content: currentContent }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };

      // Send request to OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.href,
          "X-Title": "MediSage",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || 
          `API error: ${response.status} ${response.statusText}`
        );
      }

      const aiResponse = data?.choices?.[0]?.message?.content || null;

      if (!aiResponse) {
        throw new Error("No response received from the AI");
      }

      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: aiResponse },
      ]);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: "I apologize, but I encountered an error while processing your request. Please check your API key and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDocumentSelect = (docUrl) => {
    sendMessage(docUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
      <div className="flex h-screen">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div
          className={`
            fixed inset-y-0 left-0 transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }
            lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30
            w-64 bg-white shadow-lg
          `}
        >
          <div className="p-6">
            <Link href="/home">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-green-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

        <div className="flex-1 flex flex-col w-full">
          <div className="p-6 bg-white shadow-sm">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 pl-16 lg:pl-0">
                Your Personal Health Assistant
              </h1>
              <p className="text-gray-600 pl-16 lg:pl-0">
                Powered by advanced AI to analyze, predict, and guide your health journey
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full p-6">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-lime-500 to-green-500 text-white"
                        : "bg-white shadow-sm text-gray-800"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-sm px-4 py-3 rounded-2xl">
                    <Loader2 className="w-5 h-5 animate-spin text-lime-500" />
                  </div>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    onClick={() => handleExampleClick(example.text)}
                    className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="text-2xl mb-2">{example.icon}</div>
                    <p className="text-gray-600 text-sm">{example.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 bg-white rounded-2xl shadow-sm p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none border-0 focus:ring-0 text-base p-2 max-h-32 min-h-[2.5rem]"
                  rows={1}
                />
                <div className="flex items-center gap-2 px-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Camera className="w-5 h-5 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => setShowDocuments(!showDocuments)}
                    className={`p-2 rounded-full transition-colors ${showDocuments ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={isLoading || (!inputValue.trim() && !showDocuments)}
                    className="p-2 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showDocuments && documents.length > 0 && (
                <div className="border-t pt-2 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-1 px-2">Select a document to analyze:</p>
                  {documents.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => handleDocumentSelect(doc.url)}
                      className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 rounded text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate">{doc.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {showDocuments && documents.length === 0 && (
                <div className="border-t pt-2">
                  <p className="text-sm text-gray-500 px-2">No documents available. Upload documents in the Documents section.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediSage;