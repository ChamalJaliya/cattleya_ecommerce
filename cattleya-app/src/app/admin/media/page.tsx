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
  FolderIcon,
  SparklesIcon,
  Squares2X2Icon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';

const mockMedia = [
  { id: '1', name: 'cattleya-premium-1.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x1080', uploadDate: '2024-01-15', url: '/images/orchid1.jpg', thumbnail: '🌺' },
  { id: '2', name: 'orchid-care-guide.pdf', type: 'document', size: '1.2 MB', uploadDate: '2024-01-14', url: '/docs/care-guide.pdf', thumbnail: '📄' },
  { id: '3', name: 'rare-collection-showcase.mp4', type: 'video', size: '15.6 MB', dimensions: '1280x720', uploadDate: '2024-01-13', url: '/videos/showcase.mp4', thumbnail: '🎥' },
  { id: '4', name: 'potting-mix-texture.jpg', type: 'image', size: '1.8 MB', dimensions: '1600x900', uploadDate: '2024-01-12', url: '/images/potting-mix.jpg', thumbnail: '🏺' },
  { id: '5', name: 'fertilizer-instructions.pdf', type: 'document', size: '0.8 MB', uploadDate: '2024-01-11', url: '/docs/fertilizer.pdf', thumbnail: '📋' },
  { id: '6', name: 'orchid-bloom-timelapse.mp4', type: 'video', size: '22.3 MB', dimensions: '1920x1080', uploadDate: '2024-01-10', url: '/videos/timelapse.mp4', thumbnail: '🌸' }
];

export default function MediaPage() {
  const [media, setMedia] = useState(mockMedia);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <PhotoIcon className="w-6 h-6" />;
      case 'video': return <VideoCameraIcon className="w-6 h-6" />;
      case 'document': return <DocumentIcon className="w-6 h-6" />;
      default: return <DocumentIcon className="w-6 h-6" />;
    }
  };

  const totalSize = media.reduce((sum, item) => {
    const size = parseFloat(item.size.replace(' MB', ''));
    return sum + size;
  }, 0);
  const imageCount = media.filter(m => m.type === 'image').length;
  const videoCount = media.filter(m => m.type === 'video').length;
  const documentCount = media.filter(m => m.type === 'document').length;

  const statsData = [
    {
      name: 'Total Files',
      value: media.length.toString(),
      change: '+3',
      changeType: 'increase',
      icon: FolderIcon,
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      description: 'Files in library'
    },
    {
      name: 'Total Storage',
      value: `${totalSize.toFixed(1)} MB`,
      change: ``,
      changeType: 'increase',
      icon: SparklesIcon,
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      description: 'Storage used'
    },
    {
      name: 'Images',
      value: imageCount.toString(),
      change: '',
      changeType: 'neutral',
      icon: PhotoIcon,
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      description: 'JPG, PNG, GIF files'
    },
    {
      name: 'Videos & Docs',
      value: (videoCount + documentCount).toString(),
      change: '',
      changeType: 'neutral',
      icon: DocumentIcon,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      description: 'MP4, PDF files'
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-10"></div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                  Media Library
                </h1>
                <p className="text-gray-600 text-lg">Manage your images, videos, and documents.</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="group relative overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Upload Files
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent my-2">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search media files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4 mr-1" />
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'table'
                          ? 'bg-white shadow-sm text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <TableCellsIcon className="w-4 h-4 mr-1" />
                      Table
                    </button>
                  </div>
                  
                  <button
                    className="group/btn relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300"></div>
                    <div className="relative flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 group-hover/btn:scale-105">
                      <FunnelIcon className="w-5 h-5 mr-2" />
                      Filters
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Content Area */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMedia.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                      <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl">
                          {item.thumbnail}
                      </div>
                      <div className="p-4">
                          <h3 className="text-sm font-bold text-gray-900 mb-1 truncate group-hover:text-purple-700">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.size} {item.dimensions && `· ${item.dimensions}`}</p>
                          <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                  item.type === 'image' ? 'bg-green-100 text-green-800' : 
                                  item.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`
                              }>{item.type}</span>
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="text-gray-400 hover:text-blue-600"><EyeIcon className="w-4 h-4"/></button>
                                  <button className="text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                              </div>
                          </div>
                      </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group relative mb-8"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-purple-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Preview</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">File Name</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredMedia.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-purple-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                              {item.thumbnail}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{item.name}</div>
                            {item.dimensions && <div className="text-sm text-gray-500">{item.dimensions}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                              item.type === 'image' ? 'bg-green-100 text-green-800 border-green-200' :
                              item.type === 'video' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                          }`}>{item.type}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{item.size}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.uploadDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 