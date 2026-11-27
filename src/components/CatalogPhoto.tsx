import React from 'react';
import { useCommonsPhoto } from './useCommonsPhoto';

interface CatalogPhotoProps {
  query: string;
  fallbackQueries?: string[];
  alt: string;
  className?: string;
}

export const CatalogPhoto: React.FC<CatalogPhotoProps> = ({
  query,
  fallbackQueries = ['fishing equipment'],
  alt,
  className = 'w-full h-24',
}) => {
  const { ref, src } = useCommonsPhoto(query, fallbackQueries);
  return (
    <div ref={ref} className={`catalog-photo-frame overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 ${className}`}>
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};
