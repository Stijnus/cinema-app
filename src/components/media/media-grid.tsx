import { useNavigate } from 'react-router-dom';
import { MediaCard } from './media-card';
import { MediaItem } from '@/lib/tmdb';

interface MediaGridProps {
  media: MediaItem[];
}

export function MediaGrid({ media }: MediaGridProps) {
  const navigate = useNavigate();

  const handleMediaClick = (mediaItem: MediaItem) => {
    navigate(`/media/${mediaItem.media_type}/${mediaItem.id}`);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {media.map((mediaItem) => (
        <MediaCard
          key={`${mediaItem.media_type}-${mediaItem.id}`}
          media={mediaItem}
          mediaType={mediaItem.media_type}
          onClick={() => handleMediaClick(mediaItem)}
        />
      ))}
    </div>
  );
}
