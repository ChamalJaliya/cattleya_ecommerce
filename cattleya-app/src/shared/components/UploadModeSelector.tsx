'use client';

import { motion } from 'framer-motion';
import { ComputerDesktopIcon, CloudIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';

interface UploadModeSelectorProps {
  mode: 'computer' | 'bucket';
  onModeChange: (mode: 'computer' | 'bucket') => void;
  allowBucketSelection?: boolean;
}

export default function UploadModeSelector({
  mode,
  onModeChange,
  allowBucketSelection = true
}: UploadModeSelectorProps) {
  if (!allowBucketSelection) return null;

  const handleModeChange = (newMode: 'computer' | 'bucket') => {
    // Prevent any default form submission behavior
    onModeChange(newMode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 rounded-3xl border border-white/50 shadow-xl backdrop-blur-sm"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-3xl blur-xl"></div>
      
      <div className="relative flex items-center justify-center space-x-6">
        {/* Upload from Computer Button */}
        <motion.button
          type="button"
          onClick={() => handleModeChange('computer')}
          className={`relative group overflow-hidden rounded-2xl transition-all duration-500 ${
            mode === 'computer' 
              ? 'scale-105' 
              : 'scale-100 hover:scale-105'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glowing Border Effect */}
          <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
            mode === 'computer'
              ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 p-[2px]'
              : 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 p-[2px] opacity-0 group-hover:opacity-100'
          }`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          </div>
          
          {/* Button Content */}
          <div className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-500 ${
            mode === 'computer'
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 text-white shadow-2xl shadow-purple-500/30'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 border border-gray-200/50'
          }`}>
            {/* Icon with Animation */}
            <motion.div
              animate={mode === 'computer' ? { 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`relative ${
                mode === 'computer' ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'
              }`}
            >
              <ComputerDesktopIcon className="w-6 h-6" />
              {mode === 'computer' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <SparklesIcon className="w-3 h-3 text-yellow-300" />
                </motion.div>
              )}
            </motion.div>
            
            {/* Text */}
            <div className="flex flex-col items-start">
              <span className={`font-bold text-sm transition-colors duration-300 ${
                mode === 'computer' ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
              }`}>
                Upload from Computer
              </span>
              <span className={`text-xs transition-colors duration-300 ${
                mode === 'computer' ? 'text-purple-100' : 'text-gray-500 group-hover:text-gray-600'
              }`}>
                Drag & drop or click to browse
              </span>
            </div>
            
            {/* Active Badge */}
            {mode === 'computer' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1 shadow-lg"
              >
                <StarIcon className="w-3 h-3" />
              </motion.div>
            )}
          </div>
        </motion.button>

        {/* Divider */}
        <div className="relative">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg border border-gray-200">
            <SparklesIcon className="w-4 h-4 text-purple-500" />
          </div>
        </div>

        {/* Select from Library Button */}
        <motion.button
          type="button"
          onClick={() => handleModeChange('bucket')}
          className={`relative group overflow-hidden rounded-2xl transition-all duration-500 ${
            mode === 'bucket' 
              ? 'scale-105' 
              : 'scale-100 hover:scale-105'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Glowing Border Effect */}
          <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
            mode === 'bucket'
              ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-[2px]'
              : 'bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 p-[2px] opacity-0 group-hover:opacity-100'
          }`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          </div>
          
          {/* Button Content */}
          <div className={`relative flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all duration-500 ${
            mode === 'bucket'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/30'
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 border border-gray-200/50'
          }`}>
            {/* Icon with Animation */}
            <motion.div
              animate={mode === 'bucket' ? { 
                y: [-2, 2, -2],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`relative ${
                mode === 'bucket' ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'
              }`}
            >
              <CloudIcon className="w-6 h-6" />
              {mode === 'bucket' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <StarIcon className="w-3 h-3 text-yellow-300" />
                </motion.div>
              )}
            </motion.div>
            
            {/* Text */}
            <div className="flex flex-col items-start">
              <span className={`font-bold text-sm transition-colors duration-300 ${
                mode === 'bucket' ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
              }`}>
                Select from Library
              </span>
              <span className={`text-xs transition-colors duration-300 ${
                mode === 'bucket' ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-600'
              }`}>
                Browse existing images
              </span>
            </div>
            
            {/* Active Badge */}
            {mode === 'bucket' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-1 shadow-lg"
              >
                <StarIcon className="w-3 h-3" />
              </motion.div>
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
} 