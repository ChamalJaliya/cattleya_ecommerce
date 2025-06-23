import React, { useState } from "react";

interface CategoryCardProps {
  icon: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  name,
  description,
  isActive,
  productCount,
  onEdit,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl border border-white/60 flex flex-col md:flex-row max-w-2xl w-full transition-transform duration-200 hover:scale-[1.025] hover:shadow-3xl overflow-hidden">
      {/* Left column: full height, decorative background, centered icon */}
      <div className="relative flex-shrink-0 w-full md:w-56 flex items-center justify-center min-h-[180px] md:min-h-[220px] h-full">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 z-0" />
        {/* Decorative blurred SVG background */}
        <svg className="absolute inset-0 w-full h-full opacity-30 blur-xl z-0" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="#e9d5ff" />
          <circle cx="60" cy="60" r="40" fill="#fbcfe8" />
          <circle cx="140" cy="140" r="30" fill="#bae6fd" />
        </svg>
        {/* Main Icon centered */}
        <div className="relative z-10 flex items-center justify-center w-28 h-28 md:w-32 md:h-32">
          <img src={icon} alt={name} className="w-20 h-20 md:w-24 md:h-24 object-contain" />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1 md:mb-0 leading-tight drop-shadow-sm">
            {name}
          </h2>
          <div className="flex gap-2 mt-2 md:mt-0">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
              {productCount} products
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${
                isActive
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="mt-4 mb-4">
          <p
            className={`text-gray-700 text-base whitespace-pre-line ${
              expanded ? "" : "line-clamp-4"
            }`}
          >
            {description}
          </p>
          {description.length > 180 && (
            <button
              className="text-primary-600 text-xs mt-1 hover:underline"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center mt-auto">
          {onEdit && (
            <button
              className="flex-1 min-w-[90px] py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow hover:shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={onEdit}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m-2 2H7v-2a2 2 0 012-2h2v2a2 2 0 01-2 2z" /></svg>
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="flex-1 min-w-[90px] py-2 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold shadow hover:shadow-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={onDelete}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard; 