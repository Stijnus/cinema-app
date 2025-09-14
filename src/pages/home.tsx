import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaCardSkeleton } from '@/components/media/media-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/layout';
import { SearchBar } from '@/components/search/search-bar';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const [activeTab, setActiveTab] = useState('trending');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['popular', 'movie'] });
    queryClient.invalidateQueries({ queryKey: ['popular', 'tv'] });
    queryClient.invalidateQueries({ queryKey: ['nowPlaying'] });
  }, [queryClient]);

  const { data: trendingData, isLoading: trendingLoading, refetch: refetchTrending } = useQuery({
    queryKey: ['trending', page],
    queryFn: () => tmdbService.getTrending('all', page),
    placeholderData: (previousData) => previousData
  });

  const { data: popularMovies, isLoading: popularMoviesLoading } = useQuery({
    queryKey: ['popular', 'movie'],
    queryFn: () => tmdbService.getPopular('movie', 1)
  });

  const { data: popularTV, isLoading: popularTVLoading } = useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => tmdbService.getPopular('tv', 1)
  });

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: () => tmdbService.getNowPlaying(1)
  });

  const isLoading = trendingLoading || popularMoviesLoading || popularTVLoading || nowPlayingLoading;

  const tabs = [
    { value: 'trending', label: 'Trending', data: trendingData?.results || [] },
    { value: 'movies', label: 'Popular Movies', data: popularMovies?.results || [] },
    { value: 'tv', label: 'Popular TV', data: popularTV?.results || [] },
    { value: 'nowPlaying', label: 'Now Playing', data: nowPlaying?.results || [] },
  ];

  const handleSearch = (query: string, mediaType: 'movie' | 'tv' | 'multi') => {
    navigate(`/search?q=${encodeURIComponent(query)}&type=${mediaType}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Content
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore the world of movies and TV shows with CinematicDB
          </p>
        </div>

        <div className="mb-8">
          <SearchBar onSearch={handleSearch} isLoading={false} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeTab === 'trending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchTrending()}
                disabled={trendingLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${trendingLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <MediaCardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <MediaGrid media={tab.data} />
              )}
            </TabsContent>
          ))}
        </Tabs>

        {activeTab === 'trending' && trendingData && trendingData.total_pages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {trendingData.total_pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(prev => Math.min(trendingData.total_pages, prev + 1))}
              disabled={page === trendingData.total_pages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
