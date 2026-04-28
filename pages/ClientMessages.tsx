import React, { useEffect, useState, useRef } from 'react';
import PortalLayout from '../components/PortalLayout';
import { blink } from '../src/lib/blink';
import { 
  Send,
  User,
  Bot,
  MessageSquare,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Zap
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Input } from '../src/components/ui/input';
import { Card, CardContent } from '../src/components/ui/card';
import { toast } from 'sonner';
import { cn } from '../src/lib/utils';
import { useAuth } from '../src/hooks/useAuth';

interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const ClientMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      chat_id: 'support',
      role: 'user',
      content: newMessage,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Simulate agency response
      setTimeout(() => {
        const agencyMsg: Message = {
          id: (Date.now() + 1).toString(),
          chat_id: 'support',
          role: 'assistant',
          content: "Acknowledged. Your request has been logged into the system. An agent will review the parameters and respond within the Q1 support window.",
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, agencyMsg]);
        setIsLoading(false);
      }, 1500);

      // In a real app, you would save to DB and trigger an AI or Agent response
      await blink.db.table<Message>('messages').create({
        chat_id: 'support_channel_' + user.id,
        role: 'user',
        content: userMsg.content
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to transmit message');
      setIsLoading(false);
    }
  };

  return (
    <PortalLayout type="client">
      <div className="h-[calc(100vh-16rem)] flex flex-col bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-200">Agency Support Core</p>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">System Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-white transition-colors"><Search size={18} /></button>
            <button className="p-2 text-gray-600 hover:text-white transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.02),transparent)]"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <MessageSquare size={48} className="text-gray-600" />
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Communication Terminal Idle</p>
                <p className="text-[10px] font-mono text-gray-600">Secure AES-256 encrypted channel ready.</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "flex items-start space-x-4 max-w-[80%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border",
                  msg.role === 'user' 
                    ? "bg-white/5 border-white/10 text-gray-400" 
                    : "bg-red-600/10 border-red-600/20 text-red-600"
                )}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-white/5 border border-white/10 text-gray-300 rounded-tr-none" 
                    : "bg-red-600/10 border border-red-600/20 text-gray-200 rounded-tl-none"
                )}>
                  {msg.content}
                  <div className="mt-2 text-[9px] font-mono opacity-30 uppercase">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center space-x-2 text-red-600 font-mono text-[10px] uppercase tracking-widest animate-pulse">
              <Zap size={10} />
              <span>Agency is typing...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-6 bg-white/[0.02] border-t border-white/10 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <button type="button" className="hover:text-white transition-colors"><Paperclip size={20} /></button>
            <button type="button" className="hover:text-white transition-colors"><Smile size={20} /></button>
          </div>
          <Input 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Transmit secure message..."
            className="flex-1 bg-black border-white/10 h-12 text-sm focus:border-red-600 transition-all rounded-xl"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-gray-800"
          >
            <Send size={20} className={cn("transition-transform", newMessage.trim() && !isLoading ? "rotate-0 scale-100" : "rotate-45 scale-75")} />
          </Button>
        </form>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-8 text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em]">
        <span className="flex items-center"><Zap size={10} className="mr-2 text-red-600" /> End-to-End Encrypted</span>
        <span className="flex items-center"><Zap size={10} className="mr-2 text-red-600" /> Direct Agency Line</span>
        <span className="flex items-center"><Zap size={10} className="mr-2 text-red-600" /> Q1 Support Protocol</span>
      </div>
    </PortalLayout>
  );
};

export default ClientMessages;