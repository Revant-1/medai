"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Paperclip, Loader2, Send, Menu, FileText, X, UploadCloud } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useRouter } from 'next/navigation';

interface MessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'document';
    url: string;
    name: string;
  }>;
}

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const MediSage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id') || uuidv4();
  
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
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<ChatHistory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const userId = "user123"; // Replace with actual user ID from your auth system

  const examples = [
    { text: "Review my MRI report and provide insights", icon: "🔍" },
    { text: "Compare my blood test results", icon: "🩺" },
    { text: "Analyze my symptoms: nausea, fatigue, loss of appetite", icon: "📋" },
  ];

  useEffect(() => {
    fetchDocuments();
    fetchChatHistory();
    
    // If we have a chatId in URL params, load that chat
    if (chatId && chatId !== 'new') {
      loadChat(chatId);
    }
  }, [chatId]);

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

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat-history?userId=${userId}`);
      const data = await response.json();
      if (data.success && data.chats) {
        setHistoryList(data.chats);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const loadChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chat-history?userId=${userId}&chatId=${id}`);
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading chat:', error);
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

  const toggleFileSelection = (doc: any) => {
    const isSelected = selectedFiles.some(file => file.url === doc.url);
    
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(file => file.url !== doc.url));
    } else {
      setSelectedFiles([...selectedFiles, doc]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && selectedFiles.length === 0) return;

    const formattedContent: MessageContent[] = [];
    
    // Add text content
    if (text.trim()) {
      formattedContent.push({ type: 'text', text });
    }
    
    // Add selected files
    selectedFiles.forEach(file => {
      const isImage = file.name.match(/\.(jpeg|jpg|gif|png)$/i);
      if (isImage) {
        formattedContent.push({
          type: 'image_url',
          image_url: { url: file.url }
        });
      } else {
        // For documents we include a text reference
        formattedContent.push({
          type: 'text',
          text: `Document reference: ${file.name} at ${file.url}`
        });
      }
    });

    // Create human-readable display message
    const displayMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date(),
      attachments: selectedFiles.map(file => ({
        type: file.name.match(/\.(jpeg|jpg|gif|png)$/i) ? 'image' : 'document',
        url: file.url,
        name: file.name
      }))
    };

    setMessages(prev => [...prev, displayMessage]);
    setInputValue("");
    setIsLoading(true);
    setSelectedFiles([]);
    setShowAttachments(false);

    try {
      // Format messages for API
      const apiMessages = messages.map(msg => {
        // For display messages, convert to API format
        if (msg.attachments) {
          const formattedContent: MessageContent[] = [];
          
          if (typeof msg.content === 'string' && msg.content.trim()) {
            formattedContent.push({ type: 'text', text: msg.content });
          }
          
          msg.attachments.forEach(att => {
            if (att.type === 'image') {
              formattedContent.push({
                type: 'image_url',
                image_url: { url: att.url }
              });
            } else {
              formattedContent.push({
                type: 'text',
                text: `Document reference: ${att.name} at ${att.url}`
              });
            }
          });
          
          return {
            role: msg.role,
            content: formattedContent
          };
        }
        
        // For messages already in API format
        return {
          role: msg.role,
          content: msg.content
        };
      });
      
      // Add current message
      apiMessages.push({
        role: 'user',
        content: formattedContent
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId,
          chatId
        }),
      });

      const data = await response.json();
      
      const newAssistantMessage = {
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // If this is a new chat, update the URL with the chatId
      if (!searchParams.get('id')) {
        router.push(`/chat?id=${chatId}`);
      }
      
      // Update chat history
      fetchChatHistory();
      
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
          className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 w-64 bg-white shadow-lg flex flex-col`}
        >
          <div className="p-6 border-b">
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
          
          <div className="p-4 border-b">
            <Link href="/chat?id=new">
              <button className="w-full bg-green-100 text-green-600 font-medium py-2 px-4 rounded-lg hover:bg-green-200 transition-all flex items-center justify-center gap-2">
                <span>New Chat</span>
              </button>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Chat History</h3>
            <div className="space-y-2">
              {historyList.length > 0 ? (
                historyList.map((chat) => (
                  <Link key={chat.id} href={`/chat?id=${chat.id}`}>
                    <div className={`p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${chat.id === chatId ? 'bg-green-50 border border-green-200' : ''}`}>
                      <p className="font-medium text-gray-800 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500 truncate">{new Date(chat.timestamp).toLocaleString()}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">No chat history</p>
              )}
            </div>
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
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
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
                            className="rounded mb-2"
                          />
                        )}
                        {attachment.type === 'document' && (
                          <div className="text-sm bg-white/20 px-2 py-1 rounded mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            <span className="truncate">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    <ReactMarkdown>
                      {typeof message.content === 'string' ? message.content : 'Complex message content'}
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
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border-b">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-sm">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                      <button
                        onClick={() => toggleFileSelection(file)}
                        className="ml-1 text-green-700 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Camera className="w-5 h-5 text-gray-400" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <button 
                    onClick={() => setShowAttachments(!showAttachments)}
                    className={`p-2 rounded-full transition-colors ${showAttachments ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={isLoading || (!inputValue.trim() && selectedFiles.length === 0)}
                    className="p-2 bg-gradient-to-r from-lime-500 to-green-500 text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showAttachments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center mb-2 px-2">
                        <p className="text-sm font-medium text-gray-700">Select Documents</p>
                        <button
                          onClick={() => setShowAttachments(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {documents.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
                          {documents.map((doc, index) => (
                            <div
                              key={index}
                              onClick={() => toggleFileSelection(doc)}
                              className={`
                                p-3 rounded border cursor-pointer transition-all
                                ${selectedFiles.some(file => file.url === doc.url)
                                  ? 'bg-green-50 border-green-300 text-green-700'
                                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}
                              `}
                            >
                              <div className="flex flex-col items-center text-center">
                                <FileText className={`w-8 h-8 mb-1 ${selectedFiles.some(file => file.url === doc.url) ? 'text-green-500' : 'text-gray-400'}`} />
                                <span className="text-xs truncate w-full">{doc.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No documents available</p>
                          <Link href="/documents">
                            <button className="mt-2 text-sm text-green-600 font-medium hover:text-green-700">
                              Upload Documents
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediSage;