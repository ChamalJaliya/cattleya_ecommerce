'use client';

import { motion } from 'framer-motion';
import { ComputerDesktopIcon, CloudIcon } from '@heroicons/react/24/outline';

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
      className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200"
    >
      <button
        type="button"
        onClick={() => handleModeChange('computer')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          mode === 'computer'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
            : 'bg-white text-gray-600 hover:bg-purple-50 border border-purple-200'
        }`}
      >
        <ComputerDesktopIcon className="w-5 h-5" />
        <span className="font-medium">Upload from Computer</span>
      </button>
      
      <button
        type="button"
        onClick={() => handleModeChange('bucket')}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          mode === 'bucket'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
            : 'bg-white text-gray-600 hover:bg-purple-50 border border-purple-200'
        }`}
      >
        <CloudIcon className="w-5 h-5" />
        <span className="font-medium">Select from Library</span>
      </button>
    </motion.div>
  );
} 