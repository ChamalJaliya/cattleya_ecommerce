import React from 'react';

interface QuickRepliesProps {
  suggestions: string[];
  onClick: (suggestion: string) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({ suggestions, onClick }) => (
  <div className="space-y-3">
    {suggestions.map((suggestion, idx) => (
      <button
        key={idx}
        onClick={() => onClick(suggestion.replace(/^[🌸💧🚚📦]\s*/, ''))}
        className="block w-full text-left px-4 py-3 text-sm bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:bg-white hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {suggestion}
      </button>
    ))}
  </div>
); 