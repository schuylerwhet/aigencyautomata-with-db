import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/hooks/useAuth';
import { blink } from '../src/lib/blink';
import { Loader2, Send, Mic, X, Terminal, Maximize2, Minimize2 } from 'lucide-react';

const Chatbot: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: '0', role: 'assistant', content: 'Hello, I’m the AigencyAutomata neural assistant. I can help you architect your automation strategy or book a direct system audit via my calendar. How can I assist you today?' }
    ],
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'captureLead') {
        const leadEvent = new CustomEvent('aigency:lead_captured', {
          detail: { ...(toolCall.args as any), timestamp: Date.now() }
        });
        window.dispatchEvent(leadEvent);
      }
    },
    onFinish: (message) => {
        // Log to Blink if needed
        if (isAuthenticated && user) {
            saveMessageToBlink(message);
        }
    }
  });

  const saveMessageToBlink = async (msg: any) => {
      try {
          // Simplified logging logic
          await blink.db.table('messages').create({
              id: msg.id || `msg-${Date.now()}`,
              content: msg.content,
              role: msg.role,
              user_id: user?.id,
              timestamp: new Date().toISOString()
          });
      } catch (err) {
          console.error('Blink Log Error:', err);
      }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-8 right-8 z-50 bg-white text-black w-14 h-14 rounded-none shadow-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-black group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }}>
              <X size={24} strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <div className="relative">
                <Terminal size={24} strokeWidth={2} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Standard Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 z-50 w-full max-w-sm bg-black border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-none flex flex-col h-[550px] overflow-hidden"
          >
            <div className="bg-[#0a0a0a] p-5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-600 animate-pulse"></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural_Agent_v2</h3>
              </div>
              <div className="flex items-center space-x-2">
                 <button className="text-white/40 hover:text-white transition-colors">
                    <Maximize2 size={12} />
                 </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-black scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 text-xs leading-relaxed border ${msg.role === 'user'
                    ? 'bg-red-600 text-white border-red-600 font-bold'
                    : 'bg-[#111] text-gray-300 border-white/5 font-light'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black p-4 text-[10px] text-red-600 font-mono border border-red-600/30 animate-pulse uppercase tracking-widest flex items-center">
                    <Loader2 size={12} className="animate-spin mr-2" />
                    Neural_Grid_Processing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form 
             onSubmit={(e) => {
                 e.preventDefault();
                 handleSubmit(e);
             }}
             className="p-4 bg-[#0a0a0a] border-t border-white/10"
            >
              <div className="flex space-x-2 items-center">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="ASK_SYSTEM..."
                    className="w-full bg-black border border-white/10 text-white pl-4 pr-10 py-3 text-xs focus:border-red-600 outline-none transition-colors placeholder:text-gray-700 font-mono"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                  >
                    <Mic size={16} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-white text-black px-6 py-3 font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-20"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
