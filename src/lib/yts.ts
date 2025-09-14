import { z } from 'zod';

const YTS_API_BASE_URL = 'https://yts.mx/api/v2';

const movieSchema = z.object({
  id: z.number(),
  imdb_code: z.string(),
  title: z.string(),
  year: z.number(),
  rating: z.number(),
  runtime: z.number(),
  genres: z.array(z.string()),
  summary: z.string(),
  description_full: z.string(),
  synopsis: z.string(),
  yt_trailer_code: z.string(),
  language: z.string(),
  mpa_rating: z.string(),
  background_image: z.string(),
  background_image_original: z.string(),
  small_cover_image: z.string(),
  medium_cover_image: z.string(),
  large_cover_image: z.string(),
  torrents: z.array(z.object({
    url: z.string(),
    hash: z.string(),
    quality: z.string(),
    type: z.string(),
    seeds: z.number(),
    peers: z.number(),
    size: z.string(),
    size_bytes: z.number(),
    date_uploaded: z.string(),
    date_uploaded_unix: z.number(),
  })),
});

const listMoviesSchema = z.object({
  movie_count: z.number(),
  limit: z.number(),
  page_number: z.number(),
  movies: z.array(movieSchema),
});

export const yts = {
  async getMovieTorrents(imdbId: string) {
    try {
      const response = await fetch(`${YTS_API_BASE_URL}/list_movies.json?query_term=${imdbId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const parsedData = listMoviesSchema.safeParse(data.data);
      if (!parsedData.success) {
        console.error('Failed to parse YTS API response:', parsedData.error);
        return null;
      }
      return parsedData.data.movies[0]?.torrents || [];
    } catch (error) {
      console.error('Failed to fetch movie torrents:', error);
      return [];
    }
  },
};
