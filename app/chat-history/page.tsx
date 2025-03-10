"use client";

import React, { useState, useEffect } from 'react';
import { User, Menu, MessageSquare, Trash, X, Loader2 } from "lucide-react";
import Nav from '@/components/Nav';
import Link from "next/link";

interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  documentPath: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

const ChatHistoryPage = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/chat-history');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chat history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Remove the deleted chat from the state
      setChats(chats.filter(chat => chat._id !== chatId));
      
      // If the deleted chat was selected, clear the selection
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      setError('Failed to delete chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDocumentName = (path: string) => {
    return path.split('/').pop() || 'Unknown Document';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-gray-50">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="absolute top-0 right-0 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Sidebar */}
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
                  <User className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  MediSage
                </span>
              </div>
            </Link>
          </div>
          <Nav />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Chat History</h1>
              <p className="text-gray-600">View your previous document conversations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 h-[calc(100vh-200px)] overflow-y-auto">
                <h2 className="text-lg font-medium mb-4">Your Conversations</h2>
                
                {chats.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No chat history found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chats.map((chat) => (
                      <div 
                        key={chat._id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedChat && selectedChat._id === chat._id
                            ? 'bg-green-50 border border-green-200'
                            : 'hover:bg-gray-50 border border-gray-100'
                        }`}
                        onClick={() => setSelectedChat(chat)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800 truncate">
                              {getDocumentName(chat.documentPath)}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {formatDate(chat.updatedAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {chat.messages[0]?.content.substring(0, 50) + '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Chat Detail */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 h-[calc(100vh-200px)] overflow-y-auto">
                {selectedChat ? (
                  <div>
                    <div className="border-b pb-3 mb-4">
                      <h2 className="text-lg font-medium">
                        {getDocumentName(selectedChat.documentPath)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedChat.createdAt)}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedChat.messages.map((message, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-green-50 ml-12'
                              : 'bg-gray-50 mr-12'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">
                              {message.role === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.timestamp ? formatDate(message.timestamp) : ''}
                            </span>
                          </div>
                          <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">Select a conversation</h3>
                      <p className="text-gray-500">
                        Choose a chat from the list to view the conversation
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryPage; 