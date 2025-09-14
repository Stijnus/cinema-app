import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MediaGrid } from '@/components/media/media-grid';
import { MediaCardSkeleton } from '@/components/media/media-card';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/search-bar';
import { AlertCircle, Search as SearchIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { tmdbService } from '@/lib/tmdb';
import { useDebounce } from 'use-debounce';
import { Layout } from '@/components/layout/layout';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const mediaType = (searchParams.get('type') as 'movie' | 'tv' | 'multi') || 'multi';
  const genre = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const rating = searchParams.get('rating') || '';

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [localMediaType, setLocalMediaType] = useState<'movie' | 'tv' | 'multi'>(mediaType);
  const [localFilters, setLocalFilters] = useState({ genre, year, rating });
  const [page, setPage] = useState(1);
  const [debouncedQuery] = useDebounce(localQuery, 500);
  const [debouncedFilters] = useDebounce(localFilters, 500);

  const { data, isLoading, error, isPlaceholderData } = useQuery({
    queryKey: ['search', debouncedQuery, localMediaType, debouncedFilters, page],
    queryFn: () => {
      if (!debouncedQuery.trim()) return null;
      return tmdbService.search(debouncedQuery, page, localMediaType, {
        genre: debouncedFilters.genre || undefined,
        year: debouncedFilters.year || undefined,
        rating: debouncedFilters.rating || undefined,
      });
    },
    enabled: !!debouncedQuery.trim(),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setLocalQuery(searchQuery);
    setLocalMediaType(mediaType);
    setLocalFilters({ genre, year, rating });
  }, [searchQuery, mediaType, genre, year, rating]);

  const handleSearch = (query: string, type: 'movie' | 'tv' | 'multi', filters: { genre?: string; year?: string; rating?: string }) => {
    setPage(1);
    const params: Record<string, string> = { q: query, type };
    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.rating) params.rating = filters.rating;
    setSearchParams(params);
  };

  const totalPages = data?.total_pages || 0;
  const totalResults = data?.total_results || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Search Content
          </h1>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to search. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {debouncedQuery.trim() && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : totalResults > 0 ? (
                `Found ${totalResults.toLocaleString()} result${totalResults !== 1 ? 's' : ''} for "${debouncedQuery}"`
              ) : (
                `No results found for "${debouncedQuery}"`
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <MediaCardSkeleton key={index} />
            ))}
          </div>
        ) : data?.results && data.results.length > 0 ? (
          <>
            <MediaGrid media={data.results} />

            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || isLoading}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages || isLoading || isPlaceholderData}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : debouncedQuery.trim() && !isLoading ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              Try different keywords or adjust your filters.
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a movie or TV show title to begin your search.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
