// Chat.jsx
// Main chat interface component with voice input and AI responses

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Sparkles, User, Bot } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { sendMessageToGemini } from './geminiService';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle voice transcript changes
  const handleTranscriptChange = (transcript) => {
    setInput(transcript);
    setTimeout(() => adjustTextareaHeight(), 0);
  };

  // Handle voice recording start/stop
  const handleVoiceToggle = (isActive) => {
    setIsVoiceActive(isActive);
  };

  // Adjust textarea height dynamically based on content
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight, 
        200
      )}px`;
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  // Handle language change from voice input
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // Send message to AI
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageToSend = input.trim();
    const userMessage = { role: 'user', text: messageToSend };
    
    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input immediately
    setInput('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    setLoading(true);

    try {
      // Get AI response
      const response = await sendMessageToGemini(messageToSend);
      setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
      // Handle errors
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          text: `Error: ${error.message}`, 
          isError: true 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Smart AI</h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500">
                Type a message or use voice input to start
              </p>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Assistant Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-100 rounded-3xl p-3 border border-gray-200">
            {/* Voice Input Component */}
            <VoiceInput
              onTranscriptChange={handleTranscriptChange}
              language={language}
              onLanguageChange={handleLanguageChange}
              onVoiceToggle={handleVoiceToggle}
              currentText={input}
            />

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none overflow-y-auto text-gray-800 py-2"
              style={{ minHeight: '24px', maxHeight: '200px' }}
              rows={1}
              disabled={loading}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-2.5 rounded-full transition-all flex-shrink-0 ${
                input.trim() && !loading
                  ? 'bg-purple-600 hover:bg-purple-700 hover:scale-110 shadow-md'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;