'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  VideoCameraIcon,
  FolderIcon,
  SparklesIcon,
  Squares2X2Icon,
  TableCellsIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import AdminLayout from '@/shared/components/layouts/AdminLayout';
import { useMediaStore } from '@/core/application/stores/useMediaStore';
import { mediaApi } from '@/core/infrastructure/api/mediaApi';

export default function MediaPage() {
  const {
    fetchMediaFiles,
    fetchMediaStats,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    deleteMultipleFiles,
    toggleFileSelection,
    clearSelection,
    setCurrentFolder,
    setCurrentType,
    setSearchTerm,
    setViewMode,
    setError,
    mediaFiles,
    mediaStats,
    selectedFiles,
    isLoading,
    error,
    currentFolder,
    currentType,
    searchTerm,
    viewMode,
    setSelectedFiles,
  } = useMediaStore();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const checkbox = useRef<HTMLInputElement>(null);
  const [folderOptions, setFolderOptions] = useState<{ value: string; label: string }[]>([]);

  // Memoize the filtered media files
  const filteredMedia = useMemo(() => {
    // Ensure mediaFiles is always an array
    const files = Array.isArray(mediaFiles) ? mediaFiles : [];
    // Filter out directory placeholders (e.g., type 'other', size 0, name empty)
    const realFiles = files.filter(file => file.name && file.type !== 'other' && file.size > 0);
    if (!currentFolder || currentFolder === '') {
      // All Folders: show all real files
      return realFiles
        .filter(file => {
          const typeMatch = !currentType || file.type.startsWith(currentType);
          const searchTermMatch = !searchTerm || file.name.toLowerCase().includes(searchTerm.toLowerCase());
          return typeMatch && searchTermMatch;
        })
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else {
      // Specific folder
      return realFiles
        .filter(file => {
          const folderMatch = file.folder === currentFolder;
          const typeMatch = !currentType || file.type.startsWith(currentType);
          const searchTermMatch = !searchTerm || file.name.toLowerCase().includes(searchTerm.toLowerCase());
          return folderMatch && typeMatch && searchTermMatch;
        })
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }
  }, [mediaFiles, currentFolder, currentType, searchTerm]);

  // Handle indeterminate checkbox state
  useLayoutEffect(() => {
    if (checkbox.current) {
      const isIndeterminate = selectedFiles.length > 0 && selectedFiles.length < filteredMedia.length;
      checkbox.current.indeterminate = isIndeterminate;
    }
  }, [selectedFiles, filteredMedia.length]);

  // Load initial data
  useEffect(() => {
    fetchMediaFiles();
    fetchMediaStats();
  }, [fetchMediaFiles, fetchMediaStats]);

  // Fetch folders dynamically
  useEffect(() => {
    async function fetchFolders() {
      const folders = await mediaApi.listFolders();
      // Only include valid, non-empty, top-level folder names (no nested)
      const topLevelFolders = Array.isArray(folders)
        ? folders
            .map(f => f.replace(/\/$/, '')) // remove trailing slash
            .filter(f => f && !f.includes('/')) // non-empty, no subfolders
        : [];
      setFolderOptions([
        { value: '', label: 'All Folders' },
        ...topLevelFolders.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))
      ]);
    }
    fetchFolders();
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setShowUploadModal(false);

    try {
      if (fileArray.length === 1) {
        await uploadFile(fileArray[0], currentFolder);
      } else {
        await uploadMultipleFiles(fileArray, currentFolder);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [uploadFile, uploadMultipleFiles, currentFolder]);

  // Handle file selection
  const handleFileSelect = useCallback((key: string) => {
    toggleFileSelection(key);
  }, [toggleFileSelection]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    try {
      await deleteMultipleFiles(selectedFiles);
      setShowDeleteModal(false);
      clearSelection();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [deleteMultipleFiles, selectedFiles, clearSelection]);

  // Handle single file delete
  const handleDeleteFile = useCallback(async (key: string) => {
    try {
      await deleteFile(key);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [deleteFile]);

  // Handle download
  const handleDownload = useCallback(async (key: string) => {
    try {
      const { url } = await mediaApi.getDownloadUrl(key);
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, []);

  // Drag and drop handlers
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
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // Filter options
  const filterOptions = [
    { value: '', label: 'All Types', icon: FolderIcon },
    { value: 'image', label: 'Images', icon: PhotoIcon },
    { value: 'video', label: 'Videos', icon: VideoCameraIcon },
    { value: 'document', label: 'Documents', icon: DocumentIcon },
    { value: 'audio', label: 'Audio', icon: VideoCameraIcon },
  ];

  // Overview cards: show stats for all folders if 'All Folders' is selected
  const statsData = (mediaStats && mediaStats.data) ? (() => {
    if (!currentFolder || currentFolder === '') {
      // All Folders: aggregate stats
      return [
        {
          name: 'Total Files',
          value: mediaStats.data.totalFiles?.toString() || '0',
          change: '+12',
          changeType: 'increase' as const,
          icon: FolderIcon,
          color: 'from-blue-500 via-cyan-500 to-sky-500',
          iconBg: 'from-blue-400 to-cyan-600',
          glowColor: 'shadow-blue-500/30',
          description: 'Files in library'
        },
        {
          name: 'Total Storage',
          value: mediaStats.data.totalSizeFormatted || '0 Bytes',
          change: '+2.5GB',
          changeType: 'increase' as const,
          icon: SparklesIcon,
          color: 'from-yellow-500 via-orange-500 to-red-500',
          iconBg: 'from-yellow-400 to-orange-600',
          glowColor: 'shadow-yellow-500/30',
          description: 'Storage used'
        },
        {
          name: 'Images',
          value: (mediaStats.data.byType?.image?.count || 0).toString(),
          change: '+8',
          changeType: 'increase' as const,
          icon: PhotoIcon,
          color: 'from-emerald-500 via-green-500 to-teal-500',
          iconBg: 'from-emerald-400 to-green-600',
          glowColor: 'shadow-emerald-500/30',
          description: 'JPG, PNG, GIF files'
        },
        {
          name: 'Videos & Docs',
          value: (((mediaStats.data.byType?.video?.count || 0) + (mediaStats.data.byType?.document?.count || 0))).toString(),
          change: '+3',
          changeType: 'increase' as const,
          icon: DocumentIcon,
          color: 'from-purple-500 via-pink-500 to-rose-500',
          iconBg: 'from-purple-400 to-pink-600',
          glowColor: 'shadow-purple-500/30',
          description: 'MP4, PDF files'
        }
      ];
    } else {
      // Specific folder: filter stats
      const folderStats = mediaStats.data.byFolder?.[currentFolder] || { count: 0, size: 0, sizeFormatted: '0 Bytes' };
      // Filter mediaFiles for this folder
      const files = Array.isArray(mediaFiles) ? mediaFiles.filter(f => f.folder === currentFolder) : [];
      const imageCount = files.filter(f => f.type === 'image').length;
      const videoCount = files.filter(f => f.type === 'video').length;
      const docCount = files.filter(f => f.type === 'document').length;
      return [
        {
          name: 'Total Files',
          value: folderStats.count.toString(),
          change: '',
          changeType: 'increase' as const,
          icon: FolderIcon,
          color: 'from-blue-500 via-cyan-500 to-sky-500',
          iconBg: 'from-blue-400 to-cyan-600',
          glowColor: 'shadow-blue-500/30',
          description: `Files in ${currentFolder}`
        },
        {
          name: 'Total Storage',
          value: folderStats.sizeFormatted || '0 Bytes',
          change: '',
          changeType: 'increase' as const,
          icon: SparklesIcon,
          color: 'from-yellow-500 via-orange-500 to-red-500',
          iconBg: 'from-yellow-400 to-orange-600',
          glowColor: 'shadow-yellow-500/30',
          description: `Storage used in ${currentFolder}`
        },
        {
          name: 'Images',
          value: imageCount.toString(),
          change: '',
          changeType: 'increase' as const,
          icon: PhotoIcon,
          color: 'from-emerald-500 via-green-500 to-teal-500',
          iconBg: 'from-emerald-400 to-green-600',
          glowColor: 'shadow-emerald-500/30',
          description: 'JPG, PNG, GIF files'
        },
        {
          name: 'Videos & Docs',
          value: (videoCount + docCount).toString(),
          change: '',
          changeType: 'increase' as const,
          icon: DocumentIcon,
          color: 'from-purple-500 via-pink-500 to-rose-500',
          iconBg: 'from-purple-400 to-pink-600',
          glowColor: 'shadow-purple-500/30',
          description: 'MP4, PDF files'
        }
      ];
    }
  })() : [];

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
                <div className="hidden md:flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-purple-500 animate-pulse" />
                  <span className="text-sm font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Media Dashboard Overview
                  </span>
                </div>
                {selectedFiles.length > 0 && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Delete Selected ({selectedFiles.length})
                    </div>
                  </button>
                )}
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="group relative overflow-hidden"
                >
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{stat.name}</p>
                        <div className="ml-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {stat.changeType === 'increase' ? (
                            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                              <ArrowUpIcon className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-xs font-bold text-green-700">{stat.change}</span>
                            </div>
                          ) : (
                            <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
                              <ArrowDownIcon className="w-3 h-3 text-red-600 mr-1" />
                              <span className="text-xs font-bold text-red-700">{stat.change}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">vs last month</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    </div>
                    <div className="relative">
                      <div className={`w-16 h-16 bg-gradient-to-r ${stat.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${stat.glowColor} group-hover:shadow-xl transition-all duration-300`}>
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center"
            >
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </motion.div>
          )}

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
                  {/* Folder Filter */}
                  <select
                    value={currentFolder}
                    onChange={e => {
                      const folder = e.target.value;
                      setCurrentFolder(folder);
                      if (!folder) {
                        // All Folders: omit folder param
                        fetchMediaFiles();
                      } else {
                        fetchMediaFiles({ folder });
                      }
                    }}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    {folderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Type Filter */}
                  <select
                    value={currentType || ''}
                    onChange={(e) => setCurrentType(e.target.value || null)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                  >
                    {filterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

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
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Content Area */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMedia.map((item, index) => (
                <motion.div 
                  key={item.key} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="group relative"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-300"></div>
                  <div className={`relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:scale-105 ${
                    selectedFiles.includes(item.key) ? 'ring-2 ring-purple-500' : ''
                  }`}>
                    <div className="relative">
                      <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-5xl">
                        {item.type === 'image' ? (
                          <Image src={item.url} alt={item.name} className="w-full h-full object-cover" width={160} height={240} />
                        ) : (
                          <span>{mediaApi.getFileIcon(item.type)}</span>
                        )}
                      </div>
                      {selectedFiles.includes(item.key) && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                          <CheckIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-gray-900 mb-1 truncate group-hover:text-purple-700">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{mediaApi.formatFileSize(item.size)}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          item.type === 'image' ? 'bg-green-100 text-green-800' : 
                          item.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`
                        }>{item.type}</span>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDownload(item.key)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <EyeIcon className="w-4 h-4"/>
                          </button>
                          <button 
                            onClick={() => handleDeleteFile(item.key)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="w-4 h-4"/>
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFileSelect(item.key)}
                      className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                    />
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
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              ref={checkbox}
                              checked={filteredMedia.length > 0 && selectedFiles.length === filteredMedia.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFiles(filteredMedia.filter(f => f && f.key).map(f => f.key));
                                } else {
                                  clearSelection();
                                }
                              }}
                            />
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Preview</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">File Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredMedia.map((item, index) => (
                        <motion.tr
                          key={item.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-purple-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(item.key)}
                              onChange={() => handleFileSelect(item.key)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-2xl">
                              {item.type === 'image' ? (
                                <Image src={item.url} alt={item.name} className="w-full h-full object-cover rounded-lg" width={48} height={48} />
                              ) : (
                                <span>{mediaApi.getFileIcon(item.type)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.folder}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                              item.type === 'image' ? 'bg-green-100 text-green-800 border-green-200' :
                              item.type === 'video' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              'bg-blue-100 text-blue-800 border-blue-200'
                            }`}>{item.type}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {mediaApi.formatFileSize(item.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleDownload(item.key)}
                                className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteFile(item.key)}
                                className="group/action relative overflow-hidden p-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 group-hover/action:scale-110"
                              >
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

          {/* Upload Modal */}
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onMouseDown={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Files</h2>
                {/* Folder Dropdown and Create Folder */}
                <div className="flex items-center space-x-4 mb-6">
                  <select
                    value={currentFolder || ''}
                    onChange={e => setCurrentFolder(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {folderOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                    onClick={async () => {
                      const folderName = prompt('Enter new folder name:');
                      if (!folderName) return;
                      try {
                        const res = await mediaApi.createFolder(folderName);
                        if (res.success) {
                          // Refresh folder list and select new folder
                          const folders = await mediaApi.listFolders();
                          setFolderOptions([
                            { value: '', label: 'All Folders' },
                            ...folders.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))
                          ]);
                          setCurrentFolder(folderName);
                          alert('Folder created!');
                        }
                      } catch {
                        alert('Failed to create folder.');
                      }
                    }}
                  >
                    + Create Folder
                  </button>
                </div>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive ? 'border-purple-500 bg-purple-50/50' : 'border-gray-300 bg-gray-50/50'}`}
                >
                  <CloudArrowUpIcon className="mx-auto h-16 w-16 text-purple-400" />
                  <h3 className="mt-4 text-2xl font-semibold text-gray-800">Drag & Drop Files</h3>
                  <p className="mt-2 text-gray-500">or</p>
                  <label htmlFor="file-upload" className="mt-4 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer transition-transform hover:scale-105">
                    Select Files
                  </label>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
                  <p className="mt-4 text-xs text-gray-500">Maximum file size: 50MB</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Delete Files</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete {selectedFiles.length} selected file(s)? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 