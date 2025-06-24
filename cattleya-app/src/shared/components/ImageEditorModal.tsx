'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  XMarkIcon,
  CameraIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
  DocumentArrowUpIcon,
  AdjustmentsHorizontalIcon,
  MinusIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckIcon,
  ScissorsIcon,
  ArrowPathRoundedSquareIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ImageData {
  id: string;
  file?: File;
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
  isFromBucket?: boolean;
  bucketKey?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
}

interface ImageEditorModalProps {
  image: ImageData | null;
  onClose: () => void;
  onUpdate: (id: string, settings: Partial<ImageData>) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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

type EditorTab = 'transform' | 'adjust' | 'export';

export default function ImageEditorModal({ image, onClose, onUpdate }: ImageEditorModalProps) {
  const dragControls = useDragControls();
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<EditorTab>('transform');
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply filters in real-time - moved before early return
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((image.rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Apply filters
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] = Math.min(255, Math.max(0, data[i] + image.brightness));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + image.brightness));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + image.brightness));

        // Contrast
        const factor = (259 * (image.contrast + 255)) / (255 * (259 - image.contrast));
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
    };
    img.src = image.croppedPreview || image.preview;
  }, [image?.brightness, image?.contrast, image?.rotation, image?.preview, image?.croppedPreview]);

  // Generate and update thumbnail preview
  useEffect(() => {
    if (!image) return;

    if (!thumbnailCanvasRef.current) {
      thumbnailCanvasRef.current = document.createElement('canvas');
    }
    const canvas = thumbnailCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const generate = () => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Set canvas to image dimensions to draw with filters
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.save();
        
        // Apply transformations
        ctx.filter = `brightness(${1 + image.brightness / 100}) contrast(${1 + image.contrast / 100})`;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((image.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
        
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        
        // Create a final canvas for zoom/pan and output
        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d');
        if (!outputCtx) return;

        const zoom = image.zoom || 1;
        const panX = image.panOffset.x;
        const panY = image.panOffset.y;

        // The viewport for the thumbnail should match the aspect ratio of the main preview area
        const viewportAspectRatio = containerRef.current ? containerRef.current.clientWidth / containerRef.current.clientHeight : 1;
        
        // Set output dimensions
        const outputWidth = 400;
        const outputHeight = outputWidth / viewportAspectRatio;
        outputCanvas.width = outputWidth;
        outputCanvas.height = outputHeight;

        // Clear and draw the transformed (filtered/rotated) image onto the output canvas with zoom and pan
        outputCtx.clearRect(0, 0, outputWidth, outputHeight);
        outputCtx.drawImage(
          canvas,
          (canvas.width - canvas.width / zoom) / 2 - panX,
          (canvas.height - canvas.height / zoom) / 2 - panY,
          canvas.width / zoom,
          canvas.height / zoom,
          0,
          0,
          outputWidth,
          outputHeight
        );
        
        const dataUrl = outputCanvas.toDataURL(image.format, image.quality / 100);
        onUpdate(image.id, { editedPreview: dataUrl });
      };
      img.src = image.croppedPreview || image.preview;
    };

    const debounceTimeout = setTimeout(generate, 300);
    return () => clearTimeout(debounceTimeout);

  }, [image]);

  // Initialize crop area when entering crop mode
  useEffect(() => {
    if (isCropping && imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height) * 0.8;
      const x = (rect.width - size) / 2;
      const y = (rect.height - size) / 2;
      setCropArea({ x, y, width: size, height: size });
    }
  }, [isCropping]);

  if (!image) return null;

  const handlePanStart = (e: React.MouseEvent) => {
    if (!image || image.zoom <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setPanStart({
      x: e.clientX - image.panOffset.x,
      y: e.clientY - image.panOffset.y,
    });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || !image) return;
    e.preventDefault();
    const x = e.clientX - panStart.x;
    const y = e.clientY - panStart.y;
    onUpdate(image.id, { panOffset: { x, y } });
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  const handleCropStart = (handle: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragHandle(handle);
  };

  const handleCropMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragHandle || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropArea(prev => {
      const newArea = { ...prev };
      const minSize = 50;

      switch (dragHandle) {
        case 'top-left':
          newArea.x = Math.min(x, prev.x + prev.width - minSize);
          newArea.y = Math.min(y, prev.y + prev.height - minSize);
          newArea.width = prev.x + prev.width - newArea.x;
          newArea.height = prev.y + prev.height - newArea.y;
          break;
        case 'top-right':
          newArea.y = Math.min(y, prev.y + prev.height - minSize);
          newArea.width = Math.max(x - prev.x, minSize);
          newArea.height = prev.y + prev.height - newArea.y;
          break;
        case 'bottom-left':
          newArea.x = Math.min(x, prev.x + prev.width - minSize);
          newArea.width = prev.x + prev.width - newArea.x;
          newArea.height = Math.max(y - prev.y, minSize);
          break;
        case 'bottom-right':
          newArea.width = Math.max(x - prev.x, minSize);
          newArea.height = Math.max(y - prev.y, minSize);
          break;
      }

      // Constrain to image bounds
      newArea.x = Math.max(0, Math.min(newArea.x, rect.width - newArea.width));
      newArea.y = Math.max(0, Math.min(newArea.y, rect.height - newArea.height));
      newArea.width = Math.min(newArea.width, rect.width - newArea.x);
      newArea.height = Math.min(newArea.height, rect.height - newArea.y);

      return newArea;
    });
  };

  const handleCropEnd = () => {
    setIsDragging(false);
    setDragHandle(null);
  };

  const applyCrop = () => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate crop dimensions relative to original image
      const scaleX = img.width / imageRef.current!.offsetWidth;
      const scaleY = img.height / imageRef.current!.offsetHeight;
      
      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      const croppedDataUrl = canvas.toDataURL();
      onUpdate(image.id, { 
        croppedPreview: croppedDataUrl,
        cropData: { x: cropX, y: cropY, width: cropWidth, height: cropHeight }
      });
      
      setIsCropping(false);
      toast.success('Image cropped successfully! ✨');
    };
    img.src = image.preview;
  };

  const resetImage = () => {
    onUpdate(image.id, {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
      rotation: 0,
      zoom: 1,
      quality: 80,
      format: 'jpeg',
      aspectRatio: '1:1',
      croppedPreview: undefined,
      cropData: undefined,
      panOffset: { x: 0, y: 0 },
    });
    toast.success('All settings reset! 🔄');
  };

  const resetAdjustment = (adjustment: string) => {
    const resetValues: any = {};
    resetValues[adjustment] = adjustment === 'rotation' ? 0 : 0;
    onUpdate(image.id, resetValues);
  };

  const CropHandle = ({ position, className }: { position: string; className: string }) => (
    <div
      className={`absolute w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 border-2 border-white rounded-full shadow-lg cursor-pointer hover:scale-125 transition-transform duration-200 ${className}`}
      style={{
        left: position.includes('left') ? cropArea.x - 12 : cropArea.x + cropArea.width - 12,
        top: position.includes('top') ? cropArea.y - 12 : cropArea.y + cropArea.height - 12,
      }}
      onMouseDown={(e) => handleCropStart(position, e)}
    />
  );

  const displayImage = image.croppedPreview || previewUrl || image.preview;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Simple Blur Overlay Background */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <motion.div
          drag
          dragListener={false}
          dragControls={dragControls}
          initial={{ scale: 0.7, opacity: 0, y: 100, rotateX: -15 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 100, rotateX: -15 }}
          transition={{ 
            type: "spring", 
            damping: 30, 
            stiffness: 300,
            duration: 0.6
          }}
          className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden border border-white/30"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Consistent Pink/Purple Header */}
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 text-white p-6 overflow-hidden cursor-grab"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CameraIcon className="w-7 h-7" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                    Image Editor
                  </h2>
                  <p className="text-pink-100 text-sm font-medium">Professional image editing tools</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-6 h-6 text-pink-300" />
                </motion.div>
              </div>
              <motion.button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all duration-200 p-3 hover:bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:border-white/40"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          <div className="flex" style={{ height: 'calc(80vh - 98px)' }}>
            {/* Image Preview with Consistent Styling */}
            <div className="flex-[2_2_0%] p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center relative overflow-hidden">
              {isCropping ? (
                <div 
                  ref={containerRef}
                  className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white"
                  onMouseMove={handleCropMove}
                  onMouseUp={handleCropEnd}
                  onMouseLeave={handleCropEnd}
                >
                  <img
                    ref={imageRef}
                    src={image.preview}
                    alt="Crop Preview"
                    className="max-w-full max-h-full object-contain cursor-crosshair"
                    style={{ transform: `scale(${image.zoom || 1})` }}
                  />
                  
                  {/* Crop Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70">
                    <div
                      className="absolute border-2 border-white bg-transparent shadow-2xl"
                      style={{
                        left: cropArea.x,
                        top: cropArea.y,
                        width: cropArea.width,
                        height: cropArea.height,
                      }}
                    />
                  </div>

                  {/* Crop Handles with Pink/Purple Theme */}
                  <CropHandle position="top-left" className="cursor-nw-resize" />
                  <CropHandle position="top-right" className="cursor-ne-resize" />
                  <CropHandle position="bottom-left" className="cursor-sw-resize" />
                  <CropHandle position="bottom-right" className="cursor-se-resize" />

                  {/* Instructions */}
                  <div className="absolute top-4 left-4 bg-black/80 text-white px-4 py-3 rounded-2xl text-sm backdrop-blur-md border border-white/20 shadow-lg">
                    ✨ Drag handles to crop • Use zoom to adjust view
                  </div>
                </div>
              ) : (
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute -inset-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                  <div 
                    ref={containerRef}
                    className="relative max-w-full max-h-full rounded-3xl shadow-2xl border-4 border-white overflow-hidden"
                    onMouseDown={handlePanStart}
                    onMouseMove={handlePanMove}
                    onMouseUp={handlePanEnd}
                    onMouseLeave={handlePanEnd}
                    style={{ cursor: image.zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                  >
                    <img
                      src={displayImage}
                      alt="Preview"
                      className="relative w-full h-full object-contain transition-transform duration-200"
                      style={{ 
                        transform: `translate(${image.panOffset.x}px, ${image.panOffset.y}px) scale(${image.zoom || 1})`,
                      }}
                    />
                  </div>
                  {(image.brightness !== 0 || image.contrast !== 0 || image.rotation !== 0) && (
                    <motion.div 
                      className="absolute top-4 left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-2xl text-sm flex items-center shadow-lg backdrop-blur-md border border-white/20"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Live Preview Active
                    </motion.div>
                  )}
                </motion.div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Enhanced Settings Panel with Pro Toolbar - Adjusted for better ratio */}
            <div className="flex-[1_1_0%] min-w-[420px] max-w-[450px] bg-gradient-to-b from-white to-gray-50 border-l border-gray-200/50 flex flex-col">
              <div className="flex-shrink-0 p-4 border-b border-gray-200/80 bg-white/50">
                <div className="flex justify-around bg-gray-100 rounded-xl p-1.5">
                  <TabButton
                    id="transform"
                    label="Transform"
                    icon={ScissorsIcon}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                  />
                  <TabButton
                    id="adjust"
                    label="Adjust"
                    icon={AdjustmentsHorizontalIcon}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                  />
                   <TabButton
                    id="export"
                    label="Export"
                    icon={DocumentArrowUpIcon}
                    activeTab={activeTab}
                    onClick={setActiveTab}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'transform' && (
                      <div className="space-y-8">
                        {/* Zoom Controls */}
                        <SettingsCard title="Zoom" icon={MagnifyingGlassIcon}>
                          <div className="flex items-center space-x-3">
                            <motion.button
                              onClick={() => onUpdate(image.id, { zoom: Math.max(0.5, (image.zoom || 1) - 0.1) })}
                              className="p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 shadow-sm"
                              whileTap={{ scale: 0.95 }}
                            >
                              <MagnifyingGlassMinusIcon className="w-4 h-4" />
                            </motion.button>
                            <span className="text-lg font-bold min-w-[80px] text-center bg-gray-100 px-4 py-2 rounded-xl">
                              {Math.round((image.zoom || 1) * 100)}%
                            </span>
                            <motion.button
                              onClick={() => onUpdate(image.id, { zoom: Math.min(3, (image.zoom || 1) + 0.1) })}
                              className="p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 shadow-sm"
                              whileTap={{ scale: 0.95 }}
                            >
                              <MagnifyingGlassPlusIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <div className="mt-3">
                            <input
                              type="range"
                              min="0.5"
                              max="3"
                              step="0.1"
                              value={image.zoom || 1}
                              onChange={(e) => onUpdate(image.id, { zoom: parseFloat(e.target.value) })}
                              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                          </div>
                        </SettingsCard>
                        
                        {/* Aspect Ratio */}
                        <SettingsCard title="Aspect Ratio" icon={ArrowsRightLeftIcon}>
                           <div className="grid grid-cols-2 gap-3">
                            {aspectRatios.map((ratio) => (
                              <motion.button
                                key={ratio.value}
                                onClick={() => onUpdate(image.id, { aspectRatio: ratio.value })}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                                  image.aspectRatio === ratio.value
                                    ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 shadow-lg'
                                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 hover:shadow-md'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="text-xl mb-2">{ratio.icon}</div>
                                <div className="font-semibold text-sm">{ratio.label}</div>
                              </motion.button>
                            ))}
                          </div>
                        </SettingsCard>

                        {/* Crop Button */}
                        <motion.button
                          onClick={isCropping ? applyCrop : () => setIsCropping(true)}
                          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 ${
                            isCropping 
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ScissorsIcon className="w-5 h-5" />
                          <span>{isCropping ? 'Apply Crop' : 'Crop Image'}</span>
                        </motion.button>

                      </div>
                    )}
                    {activeTab === 'adjust' && (
                       <SettingsCard title="Image Adjustments" icon={AdjustmentsHorizontalIcon}>
                          <div className="space-y-6">
                            {/* Brightness */}
                            <AdjustmentSlider
                              label="Brightness"
                              value={image.brightness}
                              min={-100}
                              max={100}
                              onChange={(value) => onUpdate(image.id, { brightness: value })}
                              onReset={() => resetAdjustment('brightness')}
                            />
                            {/* Contrast */}
                            <AdjustmentSlider
                              label="Contrast"
                              value={image.contrast}
                              min={-100}
                              max={100}
                              onChange={(value) => onUpdate(image.id, { contrast: value })}
                              onReset={() => resetAdjustment('contrast')}
                            />
                             {/* Rotation */}
                            <AdjustmentSlider
                              label="Rotation"
                              value={image.rotation}
                              min={-180}
                              max={180}
                              unit="°"
                              onChange={(value) => onUpdate(image.id, { rotation: value })}
                              onReset={() => resetAdjustment('rotation')}
                            />
                          </div>
                       </SettingsCard>
                    )}
                    {activeTab === 'export' && (
                      <SettingsCard title="Format & Quality" icon={DocumentArrowUpIcon}>
                        <div className="space-y-6">
                           <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Format</label>
                            <select
                              value={image.format}
                              onChange={(e) => onUpdate(image.id, { format: e.target.value as any })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-gray-50/50"
                            >
                              {imageFormats.map((format) => (
                                <option key={format.value} value={format.value}>
                                  {format.label} - {format.description}
                                </option>
                              ))}
                            </select>
                          </div>
                           <div>
                            <AdjustmentSlider
                                label="Quality"
                                value={image.quality}
                                min={1}
                                max={100}
                                unit="%"
                                onChange={(value) => onUpdate(image.id, { quality: value })}
                                onReset={() => onUpdate(image.id, { quality: 85 })}
                              />
                          </div>
                        </div>
                      </SettingsCard>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

               <div className="p-6 border-t border-gray-200/80">
                  <motion.button
                    onClick={resetImage}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                    <span>Reset All Settings</span>
                  </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Custom CSS for sliders */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(236, 72, 153, 0.3);
            border: 2px solid white;
            transition: all 0.2s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(236, 72, 153, 0.4);
          }
          
          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ec4899, #8b5cf6);
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 4px 8px rgba(236, 72, 153, 0.3);
            transition: all 0.2s ease;
          }
          
          .slider::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 12px rgba(236, 72, 153, 0.4);
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

interface TabButtonProps {
  id: EditorTab;
  label: string;
  icon: React.ElementType;
  activeTab: EditorTab;
  onClick: (id: EditorTab) => void;
}

const TabButton = ({ id, label, icon: Icon, activeTab, onClick }: TabButtonProps) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
      activeTab === id ? 'bg-white text-pink-700 shadow' : 'text-gray-600 hover:bg-white/50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </button>
);

interface SettingsCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const SettingsCard = ({ title, icon: Icon, children }: SettingsCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-3 text-pink-600" />
      {title}
    </h3>
    {children}
  </div>
);

interface AdjustmentSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
  onReset: () => void;
}

const AdjustmentSlider = ({ label, value, min, max, unit = '', onChange, onReset }: AdjustmentSliderProps) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}: {value}{unit}
      </label>
      <motion.button
        onClick={onReset}
        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Reset
      </motion.button>
    </div>
    <div className="flex items-center space-x-3">
      <MinusIcon className="w-5 h-5 text-gray-400" />
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <PlusIcon className="w-5 h-5 text-gray-400" />
    </div>
  </div>
);