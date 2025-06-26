import React from 'react';
import { Bot, Flower, Sparkles, Minus, X } from 'lucide-react';

interface ChatHeaderProps {
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onMinimize, onClose }) => (
  <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-6 flex items-center justify-between">
    <div className="flex items-center space-x-4">
      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
        <div className="relative">
          <Bot size={28} className="drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-xl tracking-wide flex items-center gap-2">
          <Flower size={20} className="text-yellow-300" />
          Cattleya AI
          <Sparkles size={16} className="text-yellow-300 animate-pulse" />
        </h3>
        <p className="text-sm opacity-90 font-medium">Your Orchid Concierge</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onMinimize}
        className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
      >
        <Minus size={20} />
      </button>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
      >
        <X size={20} />
      </button>
    </div>
  </div>
); 