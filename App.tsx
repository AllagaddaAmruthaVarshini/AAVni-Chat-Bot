
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Info, Newspaper } from 'lucide-react';
import { Message } from './types';
import { aavni } from './services/geminiService';
import ChatBubble from './components/ChatBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Greeting with Emojis
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm AAVni, your personal AI news companion. 🤖✨\n\nI can give you the latest headlines or answer any questions you have. \n\nWhat would you like to know today? 🗞️🤔",
      timestamp: new Date()
    }]);

    // Request location for potentially better news
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }, (err) => console.log("Location access denied. 📍"));
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: (m.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
        parts: [{ text: m.content }]
      }));

      const response = await aavni.sendMessage(textToSend, history, location);

      // Detect if this is a news list based on model prefix or prompt intent
      const isNewsQuery = textToSend.toLowerCase().includes('news') || 
                          textToSend.toLowerCase().includes('headline') || 
                          response.text.includes('🗞️');

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        links: response.links,
        isNews: isNewsQuery && response.text.includes('1.') // Confirm it has a list
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: "Oops! I encountered an error. Please try again in a bit. 🛠️",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeadlineClick = (headline: string) => {
    handleSend(`Tell me more about this headline: "${headline}"`);
  };

  const getDailyNews = () => {
    handleSend("What are the top news headlines for today?");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">AAVni</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">AAVni is Online ⚡</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={getDailyNews}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-all active:scale-95"
          >
            <Newspaper size={16} />
            Today's News 🗞️
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide space-y-4 bg-slate-50"
      >
        <div className="max-w-4xl mx-auto">
          {messages.map(msg => (
            <ChatBubble 
              key={msg.id} 
              message={msg} 
              onHeadlineClick={handleHeadlineClick} 
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <RefreshCw className="text-indigo-600 animate-spin" size={20} />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Suggested Actions (Desktop) */}
      <div className="max-w-4xl mx-auto w-full px-4 mb-2 hidden md:flex gap-2">
        <button 
          onClick={() => handleSend("What's the weather forecast today? 🌤️")}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
        >
          Weather 🌤️
        </button>
        <button 
          onClick={() => handleSend("Tell me some positive news from today! 🌈")}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
        >
          Positive News 🌈
        </button>
        <button 
          onClick={() => handleSend("Any major technology breakthroughs today? 🚀")}
          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
        >
          Tech 🚀
        </button>
      </div>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 relative z-20">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center bg-slate-100 rounded-2xl p-1 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
          >
            <button 
              type="button"
              onClick={getDailyNews}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors sm:hidden"
              title="Get News"
            >
              <Newspaper size={20} />
            </button>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AAVni anything... 💬"
              className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-4 text-slate-700 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-xl transition-all ${
                isLoading || !input.trim() 
                  ? 'bg-slate-300 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <Info size={10} /> Powered by AAVni AI ⚡
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
