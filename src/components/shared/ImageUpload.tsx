'use client';

import { useState, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (imageUrl: string | null) => void;
  maxSizeMB?: number;
  className?: string;
}

interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
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
}: ImageUploadProps) {
  const [state, setState] = useState<ImageUploadState>({
    file: null,
    previewUrl: value || null,
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);

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
    (file: File) => {
      const validation = validateImage(file);

      if (!validation.valid) {
        setState((prev) => ({ ...prev, error: validation.error || null }));
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setState((prev) => ({
          ...prev,
          file,
          previewUrl: reader.result as string,
          error: null,
        }));
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [validateImage, onChange]
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

  const handleDelete = useCallback(() => {
    setState({
      file: null,
      previewUrl: null,
      isUploading: false,
      progress: 0,
      error: null,
    });
    onChange(null);
  }, [onChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {state.previewUrl ? (
        <div className="relative">
          <img
            src={state.previewUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragOver
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          )}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            JPEG, PNG or WebP (max {maxSizeMB}MB)
          </p>
          <input
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleChange}
            className="hidden"
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input">
            <Button type="button" variant="outline" className="mt-4" asChild>
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
