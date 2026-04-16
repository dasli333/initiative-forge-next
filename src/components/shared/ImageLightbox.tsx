'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  src: string;
  alt: string;
  /** The clickable thumbnail/trigger element. */
  children: ReactNode;
  /** Extra classes on the trigger wrapper. */
  triggerClassName?: string;
}

/**
 * Wraps a thumbnail in a Dialog that opens a full-size view of the image.
 * Image is rendered with object-contain so the whole image is visible.
 */
export function ImageLightbox({ src, alt, children, triggerClassName }: ImageLightboxProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'group relative block cursor-zoom-in overflow-hidden rounded-lg',
            triggerClassName,
          )}
          aria-label={`View ${alt} full size`}
        >
          {children}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomIn className="h-8 w-8 text-white" />
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="!max-w-[90vw] w-[90vw] p-2 bg-background sm:!max-w-[90vw]">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">Full-size image view</DialogDescription>
        <div className="relative w-full h-[85vh]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
