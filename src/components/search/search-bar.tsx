import { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';

interface SearchBarProps {
  onSearch: (query: string, mediaType: 'movie' | 'tv' | 'multi', filters: { genre?: string; year?: string; rating?: string }) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<'movie' | 'tv' | 'multi'>('multi');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [rating, setRating] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  // Fetch genres based on mediaType
  const { data: genresData, isLoading: genresLoading } = useQuery({
    queryKey: ['genres', mediaType],
    queryFn: async () => {
      if (mediaType === 'multi') {
        // For multi, fetch both movie and TV genres and combine
        const [movieGenres, tvGenres] = await Promise.all([
          tmdbService.getGenres('movie'),
          tmdbService.getGenres('tv'),
        ]);
        // Combine and remove duplicates by id
        const combined = [...movieGenres.genres, ...tvGenres.genres];
        const unique = combined.filter(
          (genre, index, self) => self.findIndex((g) => g.id === genre.id) === index
        );
        return { genres: unique };
      } else {
        return tmdbService.getGenres(mediaType);
      }
    },
  });

  const genres = genresData?.genres || [];

  const handleSearch = useCallback(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery.trim(), mediaType, { genre: genre || undefined, year: year || undefined, rating: rating || undefined });
    }
  }, [debouncedQuery, mediaType, genre, year, rating, onSearch]);

  const handleClear = () => {
    setQuery('');
    setGenre('');
    setYear('');
    setRating('');
  };

  const handleClearFilter = (filterType: string) => {
    if (filterType === 'genre') setGenre('');
    if (filterType === 'year') setYear('');
    if (filterType === 'rating') setRating('');
  };

  const hasFilters = genre || year || rating;

  return (
    <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search movies, TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Select value={mediaType} onValueChange={(value: 'movie' | 'tv' | 'multi') => setMediaType(value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multi">All</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="tv">TV Shows</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[120px]">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasFilters && <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">!</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Advanced Filters</h4>
                <p className="text-sm text-muted-foreground">Refine your search results</p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="genre" className="text-sm font-medium">Genre</label>
                  <Select value={genre} onValueChange={setGenre} disabled={genresLoading}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder={genresLoading ? 'Loading...' : 'Select genre'} />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="year" className="text-sm font-medium">Year</label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 125 }, (_, i) => 2024 - i).map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="rating" className="text-sm font-medium">Min Rating</label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger className="col-span-2">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                        <SelectItem key={r} value={r.toString()}>
                          {r}+
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {genre && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Genre: {genres.find((g) => g.id.toString() === genre)?.name}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => handleClearFilter('genre')}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {year && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Year: {year}
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => handleClearFilter('year')}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Rating: {rating}+
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => handleClearFilter('rating')}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
