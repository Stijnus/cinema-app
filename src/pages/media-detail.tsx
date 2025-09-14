import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { tmdbService } from '@/lib/tmdb';
import { yts } from '@/lib/yts';
import { useMedia } from '@/hooks/use-media';
import { useAuth } from '@/hooks/use-auth';
import { TorrentCard } from '@/components/media/torrent-card';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Star, 
  Heart, 
  Plus, 
   
  AlertCircle,
  Users,
  Globe,
  DollarSign,
  TrendingUp,
  DownloadCloud
} from 'lucide-react';
import { toast } from 'sonner';

export function MediaDetailPage() {
  const { type, id } = useParams<{ type: 'movie' | 'tv'; id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mediaId = parseInt(id || '0');

  const { data: media, isLoading, error } = useQuery({
    queryKey: ['mediaDetails', type, mediaId],
    queryFn: () => {
      if (!type || !mediaId) throw new Error('Invalid media parameters');
      return tmdbService.getMediaDetails(type, mediaId);
    },
    enabled: !!type && !!mediaId,
  });

  const { data: credits } = useQuery({
    queryKey: ['credits', type, mediaId],
    queryFn: () => {
      if (!type || !mediaId) throw new Error('Invalid media parameters');
      return tmdbService.getCredits(type, mediaId);
    },
    enabled: !!type && !!mediaId,
  });

  const { data: torrents, isLoading: torrentsLoading } = useQuery({
    queryKey: ['torrents', media?.imdb_id],
    queryFn: () => {
      if (type === 'movie' && media?.imdb_id) {
        return yts.getMovieTorrents(media.imdb_id);
      }
      return null;
    },
    enabled: !!media?.imdb_id && type === 'movie',
  });

  const { addToFavorites, removeFromFavorites, addToWatchlist, removeFromWatchlist, useIsFavorite, useIsInWatchlist } = useMedia();
  
  const isFavorite = useIsFavorite(mediaId);
  const isInWatchlist = useIsInWatchlist(mediaId);

  const handleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to add favorites');
      return;
    }

    if (!media) return;

    try {
      if (isFavorite) {
        await removeFromFavorites.mutateAsync(mediaId);
        toast.success('Removed from favorites');
      } else {
        await addToFavorites.mutateAsync(media);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleWatchlist = async () => {
    if (!user) {
      toast.error('Please sign in to add to watchlist');
      return;
    }

    if (!media) return;

    try {
      if (isInWatchlist) {
        await removeFromWatchlist.mutateAsync(mediaId);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist.mutateAsync(media);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load media details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The requested media could not be found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const title = media.title || media.name;
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const runtime = media.runtime ? `${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m` : null;
  const directors = credits?.crew.filter(person => person.job === 'Director') || [];
  const mainCast = credits?.cast.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="outline" size="lg" onClick={() => navigate(-1)} className="bg-background/80 backdrop-blur-sm border-border shadow-lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Backdrop Image */}
      <div className="relative h-96 w-full overflow-hidden">
        {media.backdrop_path && (
          <img
            src={tmdbService.getBackdropUrl(media.backdrop_path, 'w1280')}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster and Actions */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center lg:items-start">
              <img
                src={tmdbService.getPosterUrl(media.poster_path, 'w500')}
                alt={title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl mb-6"
              />
              
              <div className="flex gap-3 mb-6">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="lg"
                  onClick={handleFavorite}
                  disabled={!user}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant={isInWatchlist ? "default" : "outline"}
                  size="lg"
                  onClick={handleWatchlist}
                  disabled={!user}
                >
                  <Plus className={`h-5 w-5 mr-2 ${isInWatchlist ? 'rotate-45' : ''}`} />
                  {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
                </Button>
              </div>

              {!user && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sign in to add to favorites and watchlist
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Media Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-4xl font-bold mb-2">{title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {year}
                  </div>
                  {runtime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {runtime}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {media.vote_average.toFixed(1)} ({media.vote_count.toLocaleString()} votes)
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {media.media_type}
                  </Badge>
                </div>

                {/* Genres */}
                {media.genres && media.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {media.genres.map(genre => (
                      <Badge key={genre.id} variant="outline">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tagline */}
                {media.tagline && (
                  <p className="text-lg italic text-muted-foreground mb-4">
                    "{media.tagline}"
                  </p>
                )}

                {/* Overview */}
                <p className="text-lg leading-relaxed mb-6">{media.overview}</p>
              </div>

              {/* Torrents */}
              {type === 'movie' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <DownloadCloud className="h-5 w-5 mr-2" />
                    Torrents
                  </h3>
                  {torrentsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : torrents && torrents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {torrents.map(torrent => (
                        <TorrentCard key={torrent.hash} torrent={torrent} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No torrents found for this movie.</p>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">Status</span>
                    </div>
                    <p className="capitalize">{media.status.toLowerCase()}</p>
                  </CardContent>
                </Card>

                {/* Original Language */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4" />
                      <span className="font-semibold">Language</span>
                    </div>
                    <p className="capitalize">
                      {media.spoken_languages?.[0]?.english_name || 'Unknown'}
                    </p>
                  </CardContent>
                </Card>

                {/* Budget */}
                {media.budget && media.budget > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">Budget</span>
                      </div>
                      <p>${media.budget.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Revenue */}
                {media.revenue && media.revenue > 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">Revenue</span>
                      </div>
                      <p>${media.revenue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Cast */}
              {mainCast.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {mainCast.map(person => (
                      <div key={person.id} className="text-center">
                        <img
                          src={tmdbService.getProfileUrl(person.profile_path, 'w185')}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                        />
                        <p className="text-sm font-medium truncate">{person.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directors */}
              {directors.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Directors</h3>
                  <div className="flex flex-wrap gap-4">
                    {directors.map(director => (
                      <div key={director.id} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{director.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
