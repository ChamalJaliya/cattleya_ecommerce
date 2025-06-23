'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, PhotoIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface IconUploadProps {
  onIconChange: (file: File | null) => void;
  className?: string;
  existingIconUrl?: string;
}

export default function IconUpload({ onIconChange, existingIconUrl, className = '' }: IconUploadProps) {
  const [iconPreview, setIconPreview] = useState<string | null>(existingIconUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingIconUrl) {
      setIconPreview(existingIconUrl);
    }
  }, [existingIconUrl]);

  const handleFile = useCallback((file: File) => {
    if (file.type !== 'image/svg+xml') {
      toast.error('Only SVG files are accepted for icons.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10 MB limit
      toast.error('SVG file size should not exceed 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setIconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onIconChange(file);
  }, [onIconChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const removeIcon = () => {
    setIconPreview(null);
    onIconChange(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-md border-2 border-dashed border-violet-200 flex items-center justify-center shadow-inner">
          {iconPreview ? (
            <div className="relative w-full h-full group">
              <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover rounded-full p-2" />
              <button 
                onClick={removeIcon}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove Icon"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <PhotoIcon className="w-10 h-10 text-violet-300" />
          )}
        </div>

        <div 
            className={`flex-1 h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-center
            ${dragActive ? 'border-purple-500 bg-purple-50/80' : 'border-violet-200/80 bg-white/70 hover:border-purple-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <div className="text-center">
                <CloudArrowUpIcon className={`w-8 h-8 mx-auto mb-1 transition-colors ${dragActive ? 'text-purple-600' : 'text-violet-400'}`} />
                <p className="text-sm font-semibold text-gray-700">Upload SVG</p>
                <p className="text-xs text-gray-500">Max 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml"
              className="hidden"
              onChange={handleFileSelect}
            />
        </div>
      </div>
    </div>
  );
} 