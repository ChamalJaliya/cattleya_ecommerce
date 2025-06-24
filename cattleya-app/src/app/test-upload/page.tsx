'use client';

import { useState } from 'react';
import AdvancedImageUpload from '@/shared/components/AdvancedImageUpload';

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

export default function TestUploadPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [showStats, setShowStats] = useState(false);

  const handleImagesChange = (newImages: ImageData[]) => {
    setImages(newImages);
    console.log('Images changed:', newImages);
  };

  const getStats = () => {
    const bucketImages = images.filter(img => img.isFromBucket);
    const uploadedImages = images.filter(img => !img.isFromBucket);
    const mainImage = images.find(img => img.isMain);
    const editedImages = images.filter(img => 
      img.brightness !== 0 || img.contrast !== 0 || img.rotation !== 0 || img.croppedPreview
    );

    return {
      total: images.length,
      fromBucket: bucketImages.length,
      uploaded: uploadedImages.length,
      mainImage: mainImage?.originalName || mainImage?.file?.name || 'None',
      edited: editedImages.length,
      duplicates: 0 // This would be calculated in a real scenario
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-4">
            Enhanced Image Upload Test
          </h1>
          <p className="text-gray-600 text-lg">
            Test the new dual-mode image upload system with bucket selection and duplicate prevention
          </p>
        </div>

        {/* Stats Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Upload Statistics</h2>
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showStats ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Images</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">{stats.fromBucket}</div>
              <div className="text-sm text-gray-600">From Library</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{stats.uploaded}</div>
              <div className="text-sm text-gray-600">Uploaded</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl font-bold text-orange-600">{stats.edited}</div>
              <div className="text-sm text-gray-600">Edited</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600">{stats.duplicates}</div>
              <div className="text-sm text-gray-600">Duplicates</div>
            </div>
          </div>

          {showStats && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-2">Detailed Information:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Main Image:</strong> {stats.mainImage}
                </div>
                <div>
                  <strong>Max Images:</strong> 10
                </div>
                <div>
                  <strong>Bucket Folder:</strong> products
                </div>
                <div>
                  <strong>Upload Mode:</strong> Dual (Computer + Library)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Image Upload Component */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Image Upload</h2>
          <AdvancedImageUpload
            onImagesChange={handleImagesChange}
            maxImages={10}
            allowBucketSelection={true}
            bucketFolder="products"
            className="w-full"
          />
        </div>

        {/* Image List */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Selected Images ({images.length})</h2>
            <div className="space-y-4">
              {images.map((image, index) => (
                <div key={image.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                  <img
                    src={image.croppedPreview || image.editedPreview || image.preview}
                    alt={`Image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">
                        {image.originalName || image.file?.name || `Image ${index + 1}`}
                      </span>
                      {image.isMain && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Main
                        </span>
                      )}
                      {image.isFromBucket ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Library
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Uploaded
                        </span>
                      )}
                      {(image.brightness !== 0 || image.contrast !== 0 || image.rotation !== 0 || image.croppedPreview) && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Edited
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {image.isFromBucket ? (
                        <>
                          Bucket Key: {image.bucketKey}<br/>
                          Size: {image.size ? `${(image.size / 1024).toFixed(1)} KB` : 'Unknown'}
                        </>
                      ) : (
                        <>
                          File: {image.file?.name}<br/>
                          Size: {image.file ? `${(image.file.size / 1024).toFixed(1)} KB` : 'Unknown'}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">How to Test:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Computer Upload Mode:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Drag and drop images or click to browse</li>
                <li>• Try uploading the same image twice (should be prevented)</li>
                <li>• Test image editing features</li>
                <li>• Set main image</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Library Selection Mode:</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Click "Select from Library" to browse bucket</li>
                <li>• Use search to find specific images</li>
                <li>• Switch between grid and list views</li>
                <li>• Select multiple images at once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 