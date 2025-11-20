'use client';

import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { uploadLocationImage, deleteLocationImage, uploadNPCImage, deleteNPCImage, uploadPlayerCharacterImage, deletePlayerCharacterImage, uploadFactionImage, deleteFactionImage } from '@/lib/api/storage';

type EntityType = 'location' | 'npc' | 'player_character' | 'faction';

interface ImageUploadProps {
  value?: string | null;
  onChange: (imageUrl: string | null) => void;
  maxSizeMB?: number;
  className?: string;
  campaignId: string;
  entityType?: EntityType;
}

interface ImageUploadState {
  file: File | null;
  uploadedImageUrl: string | null;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  className,
  campaignId,
  entityType = 'location',
}: ImageUploadProps) {
  const [state, setState] = useState<ImageUploadState>({
    file: null,
    uploadedImageUrl: null,
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // Compute display URL (uploaded takes precedence over value prop)
  const displayUrl = state.uploadedImageUrl || value || null;

  const validateImage = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Max size check
      if (file.size > maxSizeMB * 1024 * 1024) {
        return {
          valid: false,
          error: `Image size must be less than ${maxSizeMB} MB`,
        };
      }

      // Type check
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: 'Image must be JPEG, PNG or WebP',
        };
      }

      return { valid: true };
    },
    [maxSizeMB]
  );

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImage(file);

      if (!validation.valid) {
        setState((prev) => ({ ...prev, error: validation.error || null }));
        return;
      }

      setState((prev) => ({ ...prev, isUploading: true, error: null, progress: 0 }));

      try {
        // Simulate progress during upload
        const progressInterval = setInterval(() => {
          setState((prev) => ({ ...prev, progress: Math.min(prev.progress + 10, 90) }));
        }, 150);

        let imageUrl: string;
        if (entityType === 'npc') {
          imageUrl = await uploadNPCImage(campaignId, file);
        } else if (entityType === 'player_character') {
          imageUrl = await uploadPlayerCharacterImage(campaignId, file);
        } else if (entityType === 'faction') {
          imageUrl = await uploadFactionImage(campaignId, file);
        } else {
          imageUrl = await uploadLocationImage(campaignId, file);
        }

        clearInterval(progressInterval);
        setState((prev) => ({
          ...prev,
          file,
          uploadedImageUrl: imageUrl,
          isUploading: false,
          progress: 100,
          error: null,
        }));

        onChange(imageUrl);
      } catch (err) {
        console.error('Upload failed:', err);
        setState((prev) => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: 'Failed to upload image. Please try again.',
        }));
      }
    },
    [validateImage, onChange, campaignId, entityType]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDelete = useCallback(async () => {
    const currentUrl = state.uploadedImageUrl || value;
    if (!currentUrl) return;

    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      // Only delete from storage if it's a Supabase URL (not data URL)
      if (currentUrl.startsWith('http')) {
        if (entityType === 'npc') {
          await deleteNPCImage(currentUrl);
        } else if (entityType === 'player_character') {
          await deletePlayerCharacterImage(currentUrl);
        } else if (entityType === 'faction') {
          await deleteFactionImage(currentUrl);
        } else {
          await deleteLocationImage(currentUrl);
        }
      }

      setState({
        file: null,
        uploadedImageUrl: null,
        isUploading: false,
        progress: 0,
        error: null,
      });
      onChange(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: 'Failed to delete image. Please try again.',
      }));
    }
  }, [state.uploadedImageUrl, value, onChange, entityType]);

  return (
    <div className={cn('space-y-4', className)}>
      {displayUrl ? (
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          <Image
            src={displayUrl}
            alt="Preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDelete}
            disabled={state.isUploading}
          >
            {state.isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            state.isUploading && 'pointer-events-none opacity-50',
            isDragOver
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          )}
        >
          {state.isUploading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop an image here, or click to select
              </p>
            </>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            JPEG, PNG or WebP (max {maxSizeMB}MB)
          </p>
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleChange}
            className="hidden"
            id="image-upload-input"
            disabled={state.isUploading}
          />
          <label htmlFor="image-upload-input">
            <Button type="button" variant="outline" className="mt-4" disabled={state.isUploading} asChild>
              <span>Select Image</span>
            </Button>
          </label>
        </div>
      )}

      {state.isUploading && (
        <div className="space-y-2">
          <Progress value={state.progress} />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Uploading... {state.progress}%
          </p>
        </div>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </div>
  );
}
