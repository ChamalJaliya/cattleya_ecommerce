import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { mediaApi, MediaFile, UploadResult, MediaStatsResponse } from '../../infrastructure/api/mediaApi';

interface MediaState {
  // State
  mediaFiles: MediaFile[];
  mediaStats: MediaStatsResponse | null;
  selectedFiles: string[];
  isLoading: boolean;
  error: string | null;
  currentFolder: string;
  currentType: string | null;
  searchTerm: string;
  viewMode: 'cards' | 'table';
  uploadProgress: Record<string, number>;

  // Actions
  setMediaFiles: (files: MediaFile[]) => void;
  setMediaStats: (stats: MediaStatsResponse) => void;
  setSelectedFiles: (keys: string[]) => void;
  toggleFileSelection: (key: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentFolder: (folder: string) => void;
  setCurrentType: (type: string | null) => void;
  setSearchTerm: (term: string) => void;
  setViewMode: (mode: 'cards' | 'table') => void;
  setUploadProgress: (fileKey: string, progress: number) => void;
  clearUploadProgress: () => void;

  // API Actions
  fetchMediaFiles: (params?: { type?: string; folder?: string; search?: string }) => Promise<void>;
  fetchMediaStats: () => Promise<void>;
  uploadFile: (file: File, folder?: string, metadata?: Record<string, any>) => Promise<UploadResult>;
  uploadMultipleFiles: (files: File[], folder?: string, metadata?: Record<string, any>) => Promise<UploadResult[]>;
  deleteFile: (key: string) => Promise<void>;
  deleteMultipleFiles: (keys: string[]) => Promise<void>;
  moveFile: (key: string, destinationKey: string) => Promise<void>;
  getDownloadUrl: (key: string, expiresIn?: number) => Promise<string>;
}

export const useMediaStore = create<MediaState>()(
  devtools(
    (set, get) => ({
      // Initial State
      mediaFiles: [],
      mediaStats: null,
      selectedFiles: [],
      isLoading: false,
      error: null,
      currentFolder: '',
      currentType: null,
      searchTerm: '',
      viewMode: 'cards',
      uploadProgress: {},

      // State Setters
      setMediaFiles: (files) => set({ mediaFiles: files }),
      setMediaStats: (stats) => set({ mediaStats: stats }),
      setSelectedFiles: (keys) => set({ selectedFiles: keys }),
      toggleFileSelection: (key) => {
        const { selectedFiles } = get();
        const newSelection = selectedFiles.includes(key)
          ? selectedFiles.filter(k => k !== key)
          : [...selectedFiles, key];
        set({ selectedFiles: newSelection });
      },
      clearSelection: () => set({ selectedFiles: [] }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setCurrentFolder: (folder) => set({ currentFolder: folder }),
      setCurrentType: (type) => set({ currentType: type }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setUploadProgress: (fileKey, progress) => 
        set((state) => ({ 
          uploadProgress: { ...state.uploadProgress, [fileKey]: progress } 
        })),
      clearUploadProgress: () => set({ uploadProgress: {} }),

      // API Actions
      fetchMediaFiles: async (params = {}) => {
        try {
          set({ isLoading: true, error: null });
          const response = await mediaApi.listMedia(params);
          set({ mediaFiles: Array.isArray(response) ? response : [] });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch media files',
            mediaFiles: [] // Ensure mediaFiles is always an array even on error
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMediaStats: async () => {
        try {
          set({ isLoading: true, error: null });
          const stats = await mediaApi.getMediaStats();
          set({ mediaStats: stats });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch media stats' });
        } finally {
          set({ isLoading: false });
        }
      },

      uploadFile: async (file, folder, metadata) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate upload progress
          const fileKey = `${file.name}-${Date.now()}`;
          set((state) => ({ 
            uploadProgress: { ...state.uploadProgress, [fileKey]: 0 } 
          }));

          const progressInterval = setInterval(() => {
            set((state) => {
              const currentProgress = state.uploadProgress[fileKey] || 0;
              if (currentProgress < 90) {
                return {
                  uploadProgress: { 
                    ...state.uploadProgress, 
                    [fileKey]: currentProgress + 10 
                  }
                };
              }
              return state;
            });
          }, 100);

          const result = await mediaApi.uploadFile(file, folder, metadata);
          
          clearInterval(progressInterval);
          set((state) => ({ 
            uploadProgress: { ...state.uploadProgress, [fileKey]: 100 } 
          }));

          // Refresh media files
          await get().fetchMediaFiles();
          await get().fetchMediaStats();

          return result;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to upload file' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      uploadMultipleFiles: async (files, folder, metadata) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate upload progress for each file
          const fileKeys = files.map(file => `${file.name}-${Date.now()}-${Math.random()}`);
          set((state) => {
            const newProgress = { ...state.uploadProgress };
            fileKeys.forEach(key => newProgress[key] = 0);
            return { uploadProgress: newProgress };
          });

          const progressIntervals = fileKeys.map((fileKey, index) => 
            setInterval(() => {
              set((state) => {
                const currentProgress = state.uploadProgress[fileKey] || 0;
                if (currentProgress < 90) {
                  return {
                    uploadProgress: { 
                      ...state.uploadProgress, 
                      [fileKey]: currentProgress + 10 
                    }
                  };
                }
                return state;
              });
            }, 100 + index * 50)
          );

          const results = await mediaApi.uploadMultipleFiles(files, folder, metadata);
          
          progressIntervals.forEach(interval => clearInterval(interval));
          set((state) => {
            const newProgress = { ...state.uploadProgress };
            fileKeys.forEach(key => newProgress[key] = 100);
            return { uploadProgress: newProgress };
          });

          // Refresh media files
          await get().fetchMediaFiles();
          await get().fetchMediaStats();

          return results;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to upload files' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteFile: async (key) => {
        try {
          set({ isLoading: true, error: null });
          await mediaApi.deleteMedia(key);
          
          // Remove from local state
          set((state) => ({
            mediaFiles: state.mediaFiles.filter(file => file.key !== key),
            selectedFiles: state.selectedFiles.filter(k => k !== key)
          }));
          
          // Refresh stats
          await get().fetchMediaStats();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete file' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteMultipleFiles: async (keys) => {
        try {
          set({ isLoading: true, error: null });
          await mediaApi.deleteMultipleMedia(keys);
          
          // Remove from local state
          set((state) => ({
            mediaFiles: state.mediaFiles.filter(file => !keys.includes(file.key)),
            selectedFiles: []
          }));
          
          // Refresh stats
          await get().fetchMediaStats();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete files' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      moveFile: async (key, destinationKey) => {
        try {
          set({ isLoading: true, error: null });
          await mediaApi.moveMedia(key, destinationKey);
          
          // Refresh media files after move
          await get().fetchMediaFiles();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to move file' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      getDownloadUrl: async (key, expiresIn) => {
        try {
          set({ isLoading: true, error: null });
          const { url } = await mediaApi.getDownloadUrl(key, expiresIn);
          return url;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to get download URL' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    { name: 'mediaStore' }
  )
);

// --- Custom Hooks for State Access ---
export const useMediaFiles = () => useMediaStore((state) => state.mediaFiles);
export const useMediaStats = () => useMediaStore((state) => state.mediaStats);
export const useSelectedFiles = () => useMediaStore((state) => state.selectedFiles);
export const useMediaLoading = () => useMediaStore((state) => state.isLoading);
export const useMediaError = () => useMediaStore((state) => state.error);
export const useMediaFilters = () => useMediaStore((state) => ({
  currentFolder: state.currentFolder,
  currentType: state.currentType,
  searchTerm: state.searchTerm,
  viewMode: state.viewMode,
}));
export const useUploadProgress = () => useMediaStore((state) => state.uploadProgress); 