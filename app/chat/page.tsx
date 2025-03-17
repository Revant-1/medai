"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Paperclip, Loader2, Send, Menu, FileText } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
}

const MediSage = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "Welcome to MediSage! I'm your AI health assistant powered by OpenRouter. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const examples = [
    { text: "Review my MRI report and provide insights", icon: "🔍" },
    { text: "Compare my blood test results", icon: "🩺" },
    { text: "Analyze my symptoms: nausea, fatigue, loss of appetite", icon: "📋" },
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/list-files');
      const data = await response.json();
      setDocuments(data.files || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        fetchDocuments();
        setShowAttachments(false);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleExampleClick = (example) => {
    setInputValue(example);
  };

  const sendMessage = async (text: string, attachments?: any[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    const formattedMessages = attachments && attachments.length > 0
      ? [
          {
            role: 'user',
            content: [
              { type: 'text', text: text },
              ...attachments.map(att => ({
                type: att.type === 'image' ? 'image_url' : 'document',
                image_url: att.type === 'image' ? { url: att.url } : undefined,
                text: att.type === 'document' ? att.name : undefined,
              })),
            ],
            timestamp: new Date(),
          }
        ]
      : [{ role: 'user', content: text, timestamp: new Date() }];

    const newMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachments,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: formattedMessages,
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
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
            <div className="flex-1 overflow-y-auto space-y-4 pb-4" ref={chatContainerRef}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-lime-500 to-green-500 text-white"
                        : "bg-white shadow-sm text-gray-800"
                    }`}
                  >
                    {message.attachments?.map((attachment, i) => (
                      <div key={i} className="mb-2">
                        {attachment.type === 'image' && (
                          <Image
                            src={attachment.url}
                            alt="Attached image"
                            width={300}
                            height={200}
                            className="rounded"
                          />
                        )}
                        {attachment.type === 'document' && (
                          <div className="text-sm text-gray-500">
                            📎 {attachment.name}
                          </div>
                        )}
                      </div>
                    ))}
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
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
                    onClick={() => setShowAttachments(!showAttachments)}
                    className={`p-2 rounded-full transition-colors ${showAttachments ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isLoading || (!inputValue.trim() && !showAttachments)}
                    className="p-2 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showAttachments && documents.length > 0 && (
                <div className="border-t pt-2 max-h-40 overflow-y-auto">
                  <p className="text-xs text-gray-500 mb-1 px-2">Select a document to analyze:</p>
                  {documents.map((doc, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(inputValue, [{ type: 'document', url: doc.url, name: doc.name }])}
                      className="flex items-center gap-2 w-full px-2 py-1 hover:bg-gray-100 rounded text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate">{doc.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {showAttachments && documents.length === 0 && (
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