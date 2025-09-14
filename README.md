# 🎬 CinematicDB

A modern, responsive movie and TV show database application built with React, TypeScript, and Supabase. Discover, search, and organize your favorite media content with a beautiful cinematic interface.

## ✨ Features

- **🔍 Advanced Search**: Search across movies and TV shows with real-time results
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⭐ Personal Collections**: Save favorites and create watchlists
- **🎨 Beautiful UI**: Cinematic dark theme with smooth animations
- **🔐 Authentication**: Secure user accounts with Supabase Auth
- **📊 Rich Media Details**: Comprehensive information, cast, and crew data
- **⚡ Performance**: Optimized with React Query and lazy loading

## 📋 Table of Contents

- [Installation](#-installation)
- [Usage](#-usage)
- [Configuration](#-configuration)
- [API Integration](#-api-integration)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- TMDb API account

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cinematicdb.git
   cd cinematicdb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_TMDB_API_KEY=your_tmdb_api_key
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage

### Basic Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Key Features

#### Search Functionality
```typescript
// Example search implementation
const { data: results } = useQuery(
  ['search', query],
  () => tmdbService.search(query, 1, 'multi'),
  { enabled: !!query }
);
```

#### Authentication
```typescript
// Sign up
const { signUp } = useAuth();
await signUp(email, password);

// Sign in  
const { signIn } = useAuth();
await signIn(email, password);
```

#### Media Management
```typescript
// Add to favorites
const { data: favorites } = useQuery(
  ['favorites'],
  () => supabase.from('favorites').select('*')
);

// Add to watchlist
const addToWatchlist = async (mediaItem: MediaItem) => {
  await supabase.from('watchlist').insert({
    media_id: mediaItem.id,
    media_type: mediaItem.media_type,
    title: mediaItem.title,
    poster_path: mediaItem.poster_path,
    backdrop_path: mediaItem.backdrop_path,
    release_date: mediaItem.release_date,
    vote_average: mediaItem.vote_average
  });
};
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_TMDB_API_KEY` | The Movie Database API key | ✅ |
| `VITE_TMDB_BASE_URL` | TMDb API base URL | ✅ |
| `VITE_TMDB_IMAGE_BASE_URL` | TMDb image base URL | ✅ |

### Tailwind CSS Configuration

The project uses a custom cinematic color palette:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#9E7FFF',
      secondary: '#38bdf8', 
      accent: '#f472b6',
      background: '#171717',
      surface: '#262626',
      text: '#FFFFFF',
      textSecondary: '#A3A3A3',
      border: '#2F2F2F'
    }
  }
}
```

## 🎬 API Integration

### TMDb API Endpoints

```typescript
// Search across movies, TV shows, and people
GET /search/multi?query={query}

// Get trending content
GET /trending/{media_type}/week

// Get popular movies/TV shows  
GET /movie/popular
GET /tv/popular

// Get media details
GET /movie/{movie_id}
GET /tv/{tv_id}

// Get credits
GET /movie/{movie_id}/credits
GET /tv/{tv_id}/credits
```

### Example API Usage

```typescript
// Get trending movies
const trendingMovies = await tmdbService.getTrending('movie');

// Search for content
const searchResults = await tmdbService.search('avatar', 1, 'multi');

// Get movie details
const movieDetails = await tmdbService.getMediaDetails('movie', 12345);
```

## 🗄️ Database Schema

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Favorites Table
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  vote_average NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Watchlist Table
```sql
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  vote_average NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Testing

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/MediaGrid.test.tsx

# Run in watch mode
npm test -- --watch
```

### Test Structure

```
src/
  __tests__/
    components/
      MediaGrid.test.tsx
      MediaCard.test.tsx
    hooks/
      useAuth.test.ts
    lib/
      tmdb.test.ts
```

### Example Test

```typescript
// src/__tests__/components/MediaGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { MediaGrid } from '@/components/media/media-grid';

describe('MediaGrid', () => {
  it('renders media items correctly', () => {
    const mockMedia = [
      {
        id: 1,
        title: 'Test Movie',
        poster_path: '/test.jpg',
        vote_average: 8.5,
        media_type: 'movie'
      }
    ];

    render(<MediaGrid media={mockMedia} />);
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });
});
```

## 🛠️ Development

### Project Structure

```
src/
  components/          # Reusable UI components
    ui/               # shadcn/ui components
    media/            # Media-specific components
  hooks/              # Custom React hooks
  lib/                # Utility libraries and services
  pages/              # Page components
  types/              # TypeScript type definitions
  __tests__/          # Test files
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Git Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new functionality**
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Message Convention

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines:

### Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue template provided
3. Include steps to reproduce, expected behavior, and actual behavior
4. Provide relevant logs, screenshots, or error messages

### Pull Requests

1. Ensure your code follows the existing style
2. Add tests for new functionality
3. Update documentation as needed
4. Keep PRs focused on a single feature or fix
5. Request reviews from maintainers

### Code Review Process

1. PRs are reviewed within 48 hours
2. Two approvals required for merge
3. All tests must pass
4. Code coverage should not decrease

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```text
MIT License

Copyright (c) 2025 CinematicDB

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

### Technologies Used

- **[React](https://reactjs.org/)** - UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** - UI component library
- **[Supabase](https://supabase.com/)** - Backend and authentication
- **[TMDb API](https://www.themoviedb.org/)** - Movie and TV data
- **[React Query](https://tanstack.com/query)** - Data fetching and caching
- **[React Router](https://reactrouter.com/)** - Navigation

### Inspiration

- Netflix UI/UX patterns
- Modern streaming platform design principles
- Material Design and Apple Human Interface Guidelines

### Contributors

- Thanks to all contributors who have helped shape this project
- Special thanks to the open source community for amazing tools and libraries

---

**CinematicDB** is maintained with ❤️ by the development team. For support, please open an issue or join our community discussions.
