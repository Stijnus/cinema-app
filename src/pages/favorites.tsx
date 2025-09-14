import { useQuery } from '@tanstack/react-query';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaCardSkeleton } from '@/components/media/media-card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

export function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
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
            Please sign in to view your favorites.
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
            Failed to load favorites. Please try again later.
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
            Your Favorites
          </h1>
          <p className="text-muted-foreground">
            Movies and TV shows you've added to your favorites
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <MediaCardSkeleton key={index} />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <>
          <div className="mb-6">
            <p className="text-muted-foreground">
              {favorites.length} item{favorites.length !== 1 ? 's' : ''} in favorites
            </p>
          </div>
          <MediaGrid 
            media={favorites.map(fav => ({
              ...fav,
              title: fav.title,
              media_type: fav.media_type,
              poster_path: fav.poster_path,
              backdrop_path: fav.backdrop_path,
              vote_average: fav.vote_average,
              release_date: fav.release_date,
              first_air_date: fav.release_date,
              genre_ids: [],
              overview: '',
              popularity: 0,
              vote_count: 0,
            }))}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">
            Start adding movies and TV shows to your favorites to see them here.
          </p>
          <Button onClick={() => navigate('/')}>
            Browse Content
          </Button>
        </div>
      )}
    </div>
  );
}
