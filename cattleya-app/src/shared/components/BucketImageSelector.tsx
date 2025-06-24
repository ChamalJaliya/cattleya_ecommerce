'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FolderIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckIcon,
  CloudIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { MediaFile } from '../../core/infrastructure/api/mediaApi';
import { mediaApi } from '../../core/infrastructure/api/mediaApi';
import toast from 'react-hot-toast';

interface BucketImageSelectorProps {
  onImagesSelect: (images: MediaFile[]) => void;
  onClose: () => void;
  folder?: string;
  maxImages?: number;
  allowedTypes?: string[];
  title?: string;
  previewStyle?: 'square' | 'svg';
}

export default function BucketImageSelector({
  onImagesSelect,
  onClose,
  folder = 'products',
  maxImages = 5,
  allowedTypes = ['image'],
  title = 'Select from Image Library',
  previewStyle = 'square',
}: BucketImageSelectorProps) {
  const [bucketFiles, setBucketFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBucketFiles();
  }, [folder, allowedTypes]);

  const loadBucketFiles = async () => {
    setLoading(true);
    try {
      const files = await mediaApi.listMedia({
        folder,
        type: allowedTypes.length === 1 && allowedTypes[0] !== 'image' ? undefined : 'image',
      });
      setBucketFiles(
        files.filter(file =>
          allowedTypes.some(type =>
            type === 'image' ? file.type === 'image' : file.mimeType === type
          )
        )
      );
    } catch (error) {
      console.error('Error loading bucket files:', error);
      toast.error('Failed to load existing images');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = bucketFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileToggle = (fileKey: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileKey)) {
      newSelected.delete(fileKey);
    } else {
      if (newSelected.size >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
      newSelected.add(fileKey);
    }
    setSelectedFiles(newSelected);
  };

  const handleConfirm = () => {
    const selectedImages = bucketFiles.filter(file => selectedFiles.has(file.key));
    onImagesSelect(selectedImages);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <FolderIcon className="w-6 h-6 mr-2 text-purple-600" />
            {title}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'
              }`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'
              }`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="w-8 h-8 text-purple-600 animate-spin" />
              <span className="ml-2 text-gray-600">Loading images...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No images found</p>
            </div>
          ) : (
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-2'
            }`}>
              {filteredFiles.map((file) => (
                <motion.div
                  key={file.key}
                  layout
                  className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedFiles.has(file.key)
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => handleFileToggle(file.key)}
                >
                  {viewMode === 'grid' ? (
                    previewStyle === 'svg' ? (
                      <div className="flex items-center justify-center w-full h-32 bg-gray-50">
                        <img src={file.url} alt={file.name} className="w-20 h-20 object-contain" />
                      </div>
                    ) : (
                      <div className="aspect-square">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        {selectedFiles.has(file.key) && (
                          <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                            <CheckIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center space-x-4 p-3">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.folder}</p>
                        <p className="text-xs text-gray-400">{mediaApi.formatFileSize(file.size)}</p>
                      </div>
                      {selectedFiles.has(file.key) && (
                        <CheckIcon className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-600">
            {selectedFiles.size} image{selectedFiles.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedFiles.size === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Selected ({selectedFiles.size})
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 