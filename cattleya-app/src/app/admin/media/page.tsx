'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

const mockMedia = [
  {
    id: '1',
    name: 'cattleya-premium-1.jpg',
    type: 'image',
    size: '2.4 MB',
    dimensions: '1920x1080',
    uploadDate: '2024-01-15',
    url: '/images/orchid1.jpg',
    thumbnail: '🌺'
  },
  {
    id: '2',
    name: 'orchid-care-guide.pdf',
    type: 'document',
    size: '1.2 MB',
    uploadDate: '2024-01-14',
    url: '/docs/care-guide.pdf',
    thumbnail: '📄'
  },
  {
    id: '3',
    name: 'rare-collection-showcase.mp4',
    type: 'video',
    size: '15.6 MB',
    dimensions: '1280x720',
    uploadDate: '2024-01-13',
    url: '/videos/showcase.mp4',
    thumbnail: '🎥'
  },
  {
    id: '4',
    name: 'potting-mix-texture.jpg',
    type: 'image',
    size: '1.8 MB',
    dimensions: '1600x900',
    uploadDate: '2024-01-12',
    url: '/images/potting-mix.jpg',
    thumbnail: '🏺'
  },
  {
    id: '5',
    name: 'fertilizer-instructions.pdf',
    type: 'document',
    size: '0.8 MB',
    uploadDate: '2024-01-11',
    url: '/docs/fertilizer.pdf',
    thumbnail: '📋'
  },
  {
    id: '6',
    name: 'orchid-bloom-timelapse.mp4',
    type: 'video',
    size: '22.3 MB',
    dimensions: '1920x1080',
    uploadDate: '2024-01-10',
    url: '/videos/timelapse.mp4',
    thumbnail: '🌸'
  }
];

export default function MediaPage() {
  const [media, setMedia] = useState(mockMedia);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-6 h-6" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6" />;
      case 'document':
        return <DocumentIcon className="w-6 h-6" />;
      case 'audio':
        return <MusicalNoteIcon className="w-6 h-6" />;
      default:
        return <DocumentIcon className="w-6 h-6" />;
    }
  };

  const totalSize = media.reduce((sum, item) => {
    const size = parseFloat(item.size.replace(' MB', ''));
    return sum + size;
  }, 0);

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
              <p className="text-gray-600 mt-2">Manage your images, videos, and documents</p>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 flex items-center">
              <CloudArrowUpIcon className="w-5 h-5 mr-2" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{media.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">
                  {media.filter(m => m.type === 'image').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <VideoCameraIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Videos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {media.filter(m => m.type === 'video').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <DocumentIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(1)} MB</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="aspect-square bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center text-6xl">
                {item.thumbnail}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-gray-500">
                    {getFileIcon(item.type)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 truncate mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.size}</p>
                
                {item.dimensions && (
                  <p className="text-xs text-gray-400 mb-2">{item.dimensions}</p>
                )}
                
                <p className="text-xs text-gray-400">Uploaded: {item.uploadDate}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 