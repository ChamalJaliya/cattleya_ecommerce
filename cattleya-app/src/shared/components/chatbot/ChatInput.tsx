import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isLoading: boolean;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading, onKeyPress }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Ask me about orchids..."
          className="w-full px-4 py-3 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
          disabled={isLoading}
        />
      </div>
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <Send size={18} />
      </button>
    </div>
  );
} 