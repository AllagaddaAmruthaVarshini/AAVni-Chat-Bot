
import React from 'react';
import { Message } from '../types';
import { ExternalLink, Newspaper, User, Sparkles } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  onHeadlineClick: (headline: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onHeadlineClick }) => {
  const isAssistant = message.role === 'assistant';

  // Only render clickable items if it's an assistant message marked as news
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check for numbered lists specifically in news responses
      const headlineMatch = line.match(/^(\d+)\.\s+(.+)/);
      
      if (isAssistant && message.isNews && headlineMatch) {
        const headlineText = headlineMatch[2].trim();
        return (
          <div 
            key={idx} 
            onClick={() => onHeadlineClick(headlineText)}
            className="group flex items-start gap-2 p-2 my-1 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors border border-transparent hover:border-indigo-200"
          >
            <span className="text-indigo-600 font-bold mt-1">{headlineMatch[1]}.</span>
            <div className="flex-1">
              <p className="text-slate-800 font-medium group-hover:text-indigo-700">{headlineText}</p>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} /> Click for more details
              </span>
            </div>
          </div>
        );
      }
      
      // Standard line rendering
      return <p key={idx} className="mb-2 last:mb-0 whitespace-pre-wrap">{line}</p>;
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
          isAssistant ? 'bg-indigo-600 text-white mr-3' : 'bg-slate-200 text-slate-600 ml-3'
        }`}>
          {isAssistant ? <Newspaper size={20} /> : <User size={20} />}
        </div>
        
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
            isAssistant 
              ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
            <div className="leading-relaxed">
              {renderContent(message.content)}
            </div>
            
            {isAssistant && message.links && message.links.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-tight">Sources 🔗</p>
                <div className="flex flex-wrap gap-2">
                  {message.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <span className="truncate max-w-[120px]">{link.title}</span>
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span className="mt-1 text-[10px] text-slate-400 uppercase font-medium self-end px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
