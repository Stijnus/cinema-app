import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { HomePage } from "./pages/home";
import { AuthPage } from "./pages/auth";
import { AuthCallbackPage } from "./pages/auth-callback";
import { FavoritesPage } from "./pages/favorites";
import { WatchlistPage } from "./pages/watchlist";
import { SearchPage } from "./pages/search";
import { MediaDetailPage } from "./pages/media-detail";
import { useAuth } from "./hooks/use-auth";
import { LoadingSpinner } from "./components/ui/loading-spinner";

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <HomePage /> : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/auth"
          element={
            !isAuthenticated ? <AuthPage /> : <Navigate to="/" replace />
          }
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/favorites"
          element={
            isAuthenticated ? (
              <FavoritesPage />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/watchlist"
          element={
            isAuthenticated ? (
              <WatchlistPage />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/search"
          element={
            isAuthenticated ? <SearchPage /> : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/media/:type/:id"
          element={
            isAuthenticated ? (
              <MediaDetailPage />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App;
