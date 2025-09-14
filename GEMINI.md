# CinematicDB - Movie & TV Show Database

## Project Overview

This project is a modern, responsive movie and TV show database application built with React, TypeScript, and Supabase. It allows users to discover, search, and organize their favorite media content with a beautiful cinematic interface. The application uses Vite for the build tool, Tailwind CSS for styling, and shadcn/ui for UI components. Authentication is handled by Supabase Auth, and movie and TV show data is sourced from The Movie Database (TMDb) API.

## Building and Running

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- TMDb API account

### Key Commands

- **Install dependencies:**
  ```bash
  npm install
  ```

- **Run the development server:**
  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:3000`.

- **Build for production:**
  ```bash
  npm run build
  ```

- **Preview the production build:**
  ```bash
  npm run preview
  ```

- **Lint the code:**
  ```bash
  npm run lint
  ```

- **Type check the code:**
  ```bash
  npm run type-check
  ```

## Development Conventions

### Project Structure

The project follows a standard React project structure:

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

The project uses ESLint and Prettier for code formatting. The following commands can be used to maintain code style:

- **Format code:**
  ```bash
  npm run format
  ```

- **Check code style:**
  ```bash
  npm run lint
  ```

- **Fix auto-fixable issues:**
  ```bash
  npm run lint -- --fix
  ```

### Git Workflow

The project follows a standard Git workflow with feature branches. Commit messages should follow the conventional commit format (e.g., `feat:`, `fix:`, `docs:`, etc.).
