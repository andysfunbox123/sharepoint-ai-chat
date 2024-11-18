import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Bot, FileText, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { searchDocuments } from './services/sharepoint';
import { generateResponse } from './services/openai';

function App() {
  const { isAuthenticated, isLoading, error, login, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'I am an AI assistant that helps answer questions about your SharePoint documents.'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!isAuthenticated) {
      await login();
      return;
    }

    try {
      setIsProcessing(true);
      
      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Search SharePoint documents
      const documents = await searchDocuments(content);
      const context = documents.map(doc => `${doc.name}:\n${doc.content}`).join('\n\n');

      // Generate AI response
      const response = await generateResponse(content, context);
      
      // Add AI response
      const aiMessage: Message = {
        role: 'assistant',
        content: response.message
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SharePoint AI Assistant</h1>
              <p className="text-sm text-gray-500">Ask questions about your documents</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 1 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to SharePoint AI Assistant</h2>
              <p className="text-gray-600 mb-4">
                Ask me questions about your SharePoint documents and I'll help you find the information you need.
              </p>
              {!isAuthenticated && (
                <button
                  onClick={login}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors duration-200"
                >
                  Sign in with Microsoft
                </button>
              )}
              {error && (
                <p className="mt-4 text-red-600">{error}</p>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="divide-y">
            {messages.slice(1).map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isProcessing && (
              <div className="p-4 bg-gray-50">
                <div className="animate-pulse flex gap-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput 
        onSend={handleSend} 
        disabled={isProcessing || !isAuthenticated}
        placeholder={isAuthenticated ? 
          "Ask a question about your SharePoint documents..." : 
          "Sign in to start asking questions"
        }
      />
    </div>
  );
}

export default App;