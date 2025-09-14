import { useQuery } from '@tanstack/react-query';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaCardSkeleton } from '@/components/media/media-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export function WatchlistPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: watchlist, isLoading, error } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to view your watchlist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            Failed to load watchlist. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Your Watchlist
          </h1>
          <p className="text-muted-foreground">
            Movies and TV shows you want to watch later
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      ) : watchlist && watchlist.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {watchlist.length} item{watchlist.length !== 1 ? 's' : ''} in watchlist
            </p>
          </div>
          <MediaGrid
            media={watchlist.map(item => ({
              ...item,
              title: item.title ?? 'Untitled',
              media_type: item.media_type ?? 'movie',
              poster_path: item.poster_path ?? null,
              backdrop_path: item.backdrop_path ?? null,
              vote_average: item.vote_average ?? 0,
              release_date: item.release_date ?? null,
              first_air_date: item.first_air_date ?? null,
              genre_ids: [],
              overview: item.overview ?? '',
              popularity: item.popularity ?? 0,
              vote_count: item.vote_count ?? 0,
            }))}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <List className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No items in your watchlist yet</h3>
          <p className="text-muted-foreground mb-6">
            Add movies and TV shows to your watchlist to keep track of what you want to watch.
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Content
          </Button>
        </div>
      )}
    </div>
  );
}
