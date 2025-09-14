import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';


export function useMedia() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addToFavorites = useMutation({
    mutationFn: async (media: {
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
      media_type: 'movie' | 'tv';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          media_id: media.id,
          media_type: media.media_type,
          title: media.title || media.name || 'Unknown',
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          release_date: media.release_date || media.first_air_date || null,
          vote_average: media.vote_average,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to favorites:', error);
        throw new Error(error.message || 'Failed to add to favorites');
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      // Immediately update the favorite status to true
      queryClient.setQueryData(['isFavorite', user?.id || 'guest', variables.id], true);
      // Invalidate other queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['isFavorite'] });
    },
    onError: (error) => {
      console.error('Add to favorites failed:', error);
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (mediaId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId);

      if (error) {
        console.error('Error removing from favorites:', error);
        throw new Error(error.message || 'Failed to remove from favorites');
      }
    },
    onSuccess: (_, mediaId) => {
      // Immediately update the favorite status to false
      queryClient.setQueryData(['isFavorite', user?.id || 'guest', mediaId], false);
      // Invalidate other queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['isFavorite'] });
    },
    onError: (error) => {
      console.error('Remove from favorites failed:', error);
    },
  });

  const addToWatchlist = useMutation({
    mutationFn: async (media: {
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
      media_type: 'movie' | 'tv';
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          media_id: media.id,
          media_type: media.media_type,
          title: media.title || media.name || 'Unknown',
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          release_date: media.release_date || media.first_air_date || null,
          vote_average: media.vote_average,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding to watchlist:', error);
        throw new Error(error.message || 'Failed to add to watchlist');
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      // Immediately update the watchlist status to true
      queryClient.setQueryData(['isInWatchlist', user?.id || 'guest', variables.id], true);
      // Invalidate other queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['isInWatchlist'] });
    },
    onError: (error) => {
      console.error('Add to watchlist failed:', error);
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async (mediaId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', mediaId);

      if (error) {
        console.error('Error removing from watchlist:', error);
        throw new Error(error.message || 'Failed to remove from watchlist');
      }
    },
    onSuccess: (_, mediaId) => {
      // Immediately update the watchlist status to false
      queryClient.setQueryData(['isInWatchlist', user?.id || 'guest', mediaId], false);
      // Invalidate other queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['isInWatchlist'] });
    },
    onError: (error) => {
      console.error('Remove from watchlist failed:', error);
    },
  });

  const useIsFavorite = (mediaId: number) => {
    return useQuery({
      queryKey: ['isFavorite', user?.id || 'guest', mediaId],
      queryFn: async () => {
        if (!user) return false;

        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle();

          if (error) {
            console.error('Error checking favorite status:', error);
            return false;
          }

          const result = !!data;
          console.log('useIsFavorite result for mediaId', mediaId, ':', result, 'user:', user?.id);
          return result;
        } catch (err) {
          console.error('Failed to check favorite status:', err);
          return false;
        }
      },
      enabled: !!user && !!mediaId,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const useIsInWatchlist = (mediaId: number) => {
    return useQuery({
      queryKey: ['isInWatchlist', user?.id || 'guest', mediaId],
      queryFn: async () => {
        if (!user) return false;

        try {
          const { data, error } = await supabase
            .from('watchlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('media_id', mediaId)
            .maybeSingle();

          if (error) {
            console.error('Error checking watchlist status:', error);
            return false;
          }

          return !!data;
        } catch (err) {
          console.error('Failed to check watchlist status:', err);
          return false;
        }
      },
      enabled: !!user && !!mediaId,
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  return {
    addToFavorites,
    removeFromFavorites,
    addToWatchlist,
    removeFromWatchlist,
    useIsFavorite,
    useIsInWatchlist,
  };
}
