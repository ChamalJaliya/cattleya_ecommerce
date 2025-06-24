# Enhanced Image Upload with Bucket Selection

## Overview

The enhanced image upload system allows users to choose between uploading images from their computer or selecting from an existing image library (bucket), while preventing duplicates and providing a professional user experience.

## Features

### 🎯 Dual Upload Modes
- **Computer Upload**: Traditional drag & drop or file picker
- **Library Selection**: Browse and select from existing images in S3 bucket

### 🚫 Duplicate Prevention
- Automatic detection of duplicate files
- Prevents uploading the same image multiple times
- Works across both upload modes

### 🎨 Professional UI
- Smooth animations and transitions
- Visual indicators for image sources
- Grid and list view modes for library browsing
- Search functionality for finding images

### 🔧 Advanced Features
- Image editing capabilities
- Main image designation
- Batch selection from library
- Real-time preview

## Components

### 1. AdvancedImageUpload (Main Component)
The enhanced version of the existing image upload component with bucket selection capabilities.

**Props:**
```typescript
interface AdvancedImageUploadProps {
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  className?: string;
  allowBucketSelection?: boolean; // Enable/disable bucket selection
  bucketFolder?: string; // S3 folder to browse
}
```

### 2. UploadModeSelector
A modular component for switching between upload modes.

**Props:**
```typescript
interface UploadModeSelectorProps {
  mode: 'computer' | 'bucket';
  onModeChange: (mode: 'computer' | 'bucket') => void;
  allowBucketSelection?: boolean;
}
```

### 3. BucketImageSelector
A modal component for browsing and selecting images from the S3 bucket.

**Props:**
```typescript
interface BucketImageSelectorProps {
  onImagesSelect: (images: MediaFile[]) => void;
  onClose: () => void;
  folder?: string;
  maxImages?: number;
}
```

## Usage

### Basic Usage
```tsx
import AdvancedImageUpload from '@/shared/components/AdvancedImageUpload';

function ProductForm() {
  const [images, setImages] = useState([]);

  return (
    <AdvancedImageUpload
      onImagesChange={setImages}
      maxImages={10}
      allowBucketSelection={true}
      bucketFolder="products"
    />
  );
}
```

### Disable Bucket Selection
```tsx
<AdvancedImageUpload
  onImagesChange={setImages}
  maxImages={5}
  allowBucketSelection={false} // Only computer upload
/>
```

## Image Data Structure

The enhanced system extends the existing `ImageData` interface:

```typescript
interface ImageData {
  id: string;
  file?: File; // Only for computer uploads
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
  // New properties for bucket selection
  isFromBucket?: boolean;
  bucketKey?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
}
```

## Backend Integration

The system integrates with the existing S3 service and media API:

### Required Endpoints
- `GET /products/media` - List media files with filtering
- `POST /products/media/upload` - Upload single file
- `POST /products/media/upload-multiple` - Upload multiple files

### S3 Service Features
- File listing with metadata
- Duplicate detection
- Folder organization
- Presigned URLs for secure access

## Duplicate Prevention Logic

The system prevents duplicates through multiple checks:

1. **Bucket Files**: Compares `bucketKey` for files from the same source
2. **Computer Files**: Compares file name and size for uploaded files
3. **Cross-Source**: Prevents mixing the same file from different sources

## Visual Indicators

### Source Badges
- 🔵 **Library**: Images selected from bucket
- 🟢 **Uploaded**: Images uploaded from computer
- ⭐ **Main**: Primary product image
- ✨ **Edited**: Images with applied filters/edits

### Upload Mode Indicators
- Purple theme for computer upload
- Blue theme for library selection
- Smooth transitions between modes

## Performance Optimizations

- Lazy loading of bucket images
- Efficient duplicate checking
- Optimized image previews
- Minimal re-renders with React.memo

## Error Handling

- Graceful fallbacks for network issues
- User-friendly error messages
- Automatic retry mechanisms
- Validation feedback

## Future Enhancements

- [ ] Image compression before upload
- [ ] Bulk operations (move, delete, organize)
- [ ] Advanced search filters
- [ ] Image tagging and categorization
- [ ] AI-powered duplicate detection
- [ ] Cloud storage analytics

## Migration Guide

### From Basic ImageUpload
1. Replace import with `AdvancedImageUpload`
2. Add `allowBucketSelection` prop if needed
3. Update image data handling for new properties
4. Test duplicate prevention functionality

### Backend Requirements
1. Ensure S3 service is properly configured
2. Verify media API endpoints are accessible
3. Set up proper CORS for bucket access
4. Configure folder permissions

## Troubleshooting

### Common Issues

**Bucket images not loading**
- Check S3 credentials and permissions
- Verify folder path configuration
- Ensure CORS is properly set up

**Duplicate detection not working**
- Verify file metadata is being passed correctly
- Check that bucket keys are unique
- Ensure file size comparison is working

**Upload mode not switching**
- Check `allowBucketSelection` prop
- Verify component state management
- Ensure no conflicting CSS styles

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG_MODE = process.env.NODE_ENV === 'development';
```

## Contributing

When adding new features:
1. Maintain modular component structure
2. Add proper TypeScript types
3. Include error handling
4. Update documentation
5. Add unit tests for new functionality 