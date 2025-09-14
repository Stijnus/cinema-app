const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

if (!TMDB_API_KEY) {
  throw new Error("Missing TMDb API key");
}

export interface MediaItem {
  id: number;
  title: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  media_type: "movie" | "tv";
  genre_ids: number[];
  popularity: number;
}

export interface MediaDetails extends MediaItem {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline: string;
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  budget?: number;
  revenue?: number;
  homepage: string;
  imdb_id?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface SearchResults {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

class TMDBService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `TMDB API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("TMDB API request failed:", error);
      throw error;
    }
  }

  private getImageUrl(path: string | null, size: string = "w500"): string {
    if (!path) {
      return "/placeholder-image.jpg";
    }
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  async search(
    query: string,
    page: number = 1,
    mediaType: "movie" | "tv" | "multi" = "multi",
    filters: { genre?: string; year?: string; rating?: string } = {}
  ): Promise<SearchResults> {
    let url = `${TMDB_BASE_URL}/search/${mediaType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query
    )}&page=${page}&include_adult=false`;

    // Add filters to URL
    if (filters.genre) {
      url += `&with_genres=${filters.genre}`;
    }
    if (filters.year) {
      url += `&year=${filters.year}`;
    }
    if (filters.rating) {
      url += `&vote_average.gte=${filters.rating}`;
    }

    const data = await this.fetchWithErrorHandling<SearchResults>(url);

    // Ensure media_type is set for each result
    if (mediaType === "multi") {
      // For multi search, the API should include media_type, but ensure it's present
      data.results = data.results.map((item) => ({
        ...item,
        media_type:
          item.media_type || ((item.title ? "movie" : "tv") as "movie" | "tv"),
      }));
    } else {
      // For specific media type searches, set the media_type explicitly
      data.results = data.results.map((item) => ({
        ...item,
        media_type: mediaType as "movie" | "tv",
      }));
    }

    return data;
  }

  async getTrending(
    mediaType: "all" | "movie" | "tv" = "all",
    page: number = 1
  ): Promise<SearchResults> {
    const url = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${TMDB_API_KEY}&page=${page}`;
    const data = await this.fetchWithErrorHandling<SearchResults>(url);

    // Ensure media_type is set for each result
    if (mediaType === "all") {
      // For trending all, the API should include media_type, but ensure it's present
      data.results = data.results.map((item) => ({
        ...item,
        media_type:
          item.media_type || ((item.title ? "movie" : "tv") as "movie" | "tv"),
      }));
    } else {
      // For specific media type trending, set the media_type explicitly
      data.results = data.results.map((item) => ({
        ...item,
        media_type: mediaType as "movie" | "tv",
      }));
    }

    return data;
  }

  async getPopular(
    mediaType: "movie" | "tv",
    page: number = 1
  ): Promise<SearchResults> {
    const url = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    const data = await this.fetchWithErrorHandling<SearchResults>(url);
    data.results = data.results.map((item) => ({
      ...item,
      media_type: mediaType,
    }));
    return data;
  }

  async getTopRated(
    mediaType: "movie" | "tv",
    page: number = 1
  ): Promise<SearchResults> {
    const url = `${TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&page=${page}`;
    const data = await this.fetchWithErrorHandling<SearchResults>(url);
    data.results = data.results.map((item) => ({
      ...item,
      media_type: mediaType,
    }));
    return data;
  }

  async getNowPlaying(page: number = 1): Promise<SearchResults> {
    const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`;
    const data = await this.fetchWithErrorHandling<SearchResults>(url);
    data.results = data.results.map((item) => ({
      ...item,
      media_type: "movie",
    }));
    return data;
  }

  async getUpcoming(page: number = 1): Promise<SearchResults> {
    const url = `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`;
    const data = await this.fetchWithErrorHandling<SearchResults>(url);
    data.results = data.results.map((item) => ({
      ...item,
      media_type: "movie",
    }));
    return data;
  }

  async getMediaDetails(
    mediaType: "movie" | "tv",
    id: number
  ): Promise<MediaDetails> {
    const url = `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    return this.fetchWithErrorHandling<MediaDetails>(url);
  }

  async getCredits(
    mediaType: "movie" | "tv",
    id: number
  ): Promise<{ cast: CastMember[]; crew: CrewMember[] }> {
    const url = `${TMDB_BASE_URL}/${mediaType}/${id}/credits?api_key=${TMDB_API_KEY}`;
    return this.fetchWithErrorHandling(url);
  }

  async getGenres(mediaType: "movie" | "tv"): Promise<{ genres: Genre[] }> {
    const url = `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`;
    return this.fetchWithErrorHandling(url);
  }

  getPosterUrl(path: string | null, size: string = "w500"): string {
    return this.getImageUrl(path, size);
  }

  getBackdropUrl(path: string | null, size: string = "w1280"): string {
    return this.getImageUrl(path, size);
  }

  getProfileUrl(path: string | null, size: string = "w185"): string {
    return this.getImageUrl(path, size);
  }
}

export const tmdbService = new TMDBService();
