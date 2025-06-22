'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  CogIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  CameraIcon,
  DocumentArrowUpIcon,
  ScissorsIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ImageEditorModal from './ImageEditorModal';
import Portal from './Portal';

interface ImageData {
  id: string;
  file: File;
  preview: string;
  editedPreview?: string;
  croppedPreview?: string;
  isMain: boolean;
  aspectRatio: string;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  rotation: number;
  zoom: number;
  panOffset: { x: number; y: number };
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface AdvancedImageUploadProps {
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  className?: string;
}

const aspectRatios = [
  { value: '1:1', label: 'Square', icon: '⬜', description: 'Perfect for product thumbnails' },
  { value: '4:3', label: 'Landscape', icon: '🖼️', description: 'Traditional photo format' },
  { value: '3:4', label: 'Portrait', icon: '📱', description: 'Mobile-friendly format' },
  { value: '16:9', label: 'Widescreen', icon: '🎬', description: 'Modern display format' },
  { value: 'free', label: 'Free', icon: '🎨', description: 'Custom crop area' }
];

const imageFormats = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos, smaller size' },
  { value: 'png', label: 'PNG', description: 'Lossless, supports transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format, best compression' }
];

export default function AdvancedImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}: AdvancedImageUploadProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isCroppingActive, setIsCroppingActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createImageData = (file: File): ImageData => ({
    id: generateId(),
    file,
    preview: URL.createObjectURL(file),
    isMain: images.length === 0,
    aspectRatio: '1:1',
    quality: 85,
    format: 'jpeg',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    rotation: 0,
    zoom: 1,
    panOffset: { x: 0, y: 0 }
  });

  const handleFileSelect = useCallback((files: FileList) => {
    const newImages = Array.from(files).map(createImageData);
    
    if (images.length + newImages.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }, [images, maxImages, onImagesChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      updatedImages[0].isMain = true;
    }
    setImages(updatedImages);
    onImagesChange(updatedImages);
    
    if (selectedImage?.id === id) {
      setSelectedImage(null);
      setIsCropping(false);
    }
  };

  const setMainImage = (id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === id
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const updateImageSettings = (id: string, settings: Partial<ImageData>) => {
    const updatedImages = images.map(img => 
      img.id === id ? { ...img, ...settings } : img
    );
    setImages(updatedImages);
    onImagesChange(updatedImages);
    
    if (selectedImage?.id === id) {
      setSelectedImage({ ...selectedImage, ...settings });
    }
  };

  // Ensure only one image is main
  useEffect(() => {
    const mainImages = images.filter(img => img.isMain);
    if (mainImages.length > 1) {
      // Keep only the first one as main
      const updatedImages = images.map((img, index) => ({
        ...img,
        isMain: index === images.findIndex(mainImg => mainImg.isMain)
      }));
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } else if (mainImages.length === 0 && images.length > 0) {
      // Set first image as main if no main image exists
      const updatedImages = images.map((img, index) => ({
        ...img,
        isMain: index === 0
      }));
      setImages(updatedImages);
      onImagesChange(updatedImages);
    }
  }, [images.length, onImagesChange]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 via-violet-600/20 to-indigo-600/20 rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-purple-500/10 transition-all duration-300">
          <div
            className={`flex items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-purple-500 bg-gradient-to-br from-purple-50/80 to-violet-50/80'
                : 'border-purple-300 bg-gradient-to-br from-purple-50/60 to-violet-50/60 hover:from-purple-100/80 hover:to-violet-100/80'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <motion.div
                animate={{ 
                  y: dragActive ? [-5, 5, -5] : [-3, 3, -3],
                  scale: dragActive ? 1.1 : 1
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CloudArrowUpIcon className="w-12 h-12 mb-4 text-purple-500 group-hover:text-purple-600" />
              </motion.div>
              <p className="mb-2 text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. {maxImages} images)</p>
              <div className="flex items-center mt-2 space-x-1">
                <SparklesIcon className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs text-purple-600 font-medium">Advanced editing available</span>
                <StarIcon className="w-4 h-4 text-violet-400 animate-bounce" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            />
          </div>
        </div>
      </motion.div>

      {/* Image Grid */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`relative aspect-square rounded-2xl shadow-lg overflow-hidden group border-4 transition-all duration-300 ${
                image.isMain ? 'border-purple-500' : 'border-transparent'
              }`}
            >
              <img
                src={image.croppedPreview || image.editedPreview || image.preview}
                alt={`preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedImage(image)}
                    className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600 transition-colors duration-200 shadow-md"
                    title="Edit Image"
                  >
                    <CogIcon className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeImage(image.id)}
                    className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors duration-200 shadow-md"
                    title="Remove Image"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Main Image Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                  <StarIcon className="w-3 h-3 inline mr-1" />
                  Main
                </div>
              )}

              {/* Settings Applied Badge */}
              {(image.brightness !== 0 || image.contrast !== 0 || image.rotation !== 0 || image.croppedPreview) && (
                <div className="absolute bottom-2 left-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                  <SparklesIcon className="w-3 h-3 inline mr-1" />
                  Edited
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Image Editor Modal */}
      <AnimatePresence>
        {selectedImage && (
          <Portal>
            <ImageEditorModal
              image={selectedImage}
              onClose={() => setSelectedImage(null)}
              onUpdate={updateImageSettings}
            />
          </Portal>
        )}
      </AnimatePresence>

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
} 