import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { tmdbService } from '@/lib/tmdb';
import { useMedia } from '@/hooks/use-media';
import { Heart, Plus, Play, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface MediaCardProps {
  media: {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    release_date?: string;
    first_air_date?: string;
    genre_ids: number[];
    popularity: number;
    media_type?: 'movie' | 'tv';
  };
  mediaType: 'movie' | 'tv';
  onClick?: () => void;
}

export function MediaCard({ media, mediaType, onClick }: MediaCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToFavorites, removeFromFavorites, addToWatchlist, removeFromWatchlist, useIsFavorite, useIsInWatchlist } = useMedia();
  
  const { data: isFavorite, isLoading: isFavoriteLoading } = useIsFavorite(media.id);
  const { data: isInWatchlist, isLoading: isWatchlistLoading } = useIsInWatchlist(media.id);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to add favorites');
      return;
    }

    console.log('MediaCard - Current favorite status:', isFavorite, 'for mediaId:', media.id, 'User authenticated:', isAuthenticated);

    try {
      if (isFavorite) {
        console.log('MediaCard - Removing from favorites...');
        await removeFromFavorites.mutateAsync(media.id);
        toast.success('Removed from favorites');
      } else {
        console.log('MediaCard - Adding to favorites...');
        await addToFavorites.mutateAsync({ ...media, media_type: mediaType });
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('MediaCard - Favorite operation failed:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to add to watchlist');
      return;
    }

    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(media.id);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist.mutateAsync({ ...media, media_type: mediaType });
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';

  return (
    <Card className="group cursor-pointer overflow-hidden bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
      <div className="relative aspect-[2/3] overflow-hidden">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
        <img
          src={tmdbService.getPosterUrl(media.poster_path, 'w342')}
          alt={media.title || media.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant={isFavorite ? "default" : "secondary"}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleFavorite}
            disabled={isFavoriteLoading}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant={isInWatchlist ? "default" : "secondary"}
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={handleWatchlist}
            disabled={isWatchlistLoading}
          >
            <Plus className={`h-4 w-4 ${isInWatchlist ? 'rotate-45' : ''}`} />
          </Button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="w-full bg-primary/90 hover:bg-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <Play className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur-sm">
          {mediaType === 'movie' ? 'Movie' : 'TV'}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate mb-1">
              {media.title || media.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">{year}</p>
          </div>
          
          <div className="flex items-center gap-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{media.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {media.genre_ids?.slice(0, 2).join(' • ') || 'Unknown'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function MediaCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[2/3]">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  );
}
