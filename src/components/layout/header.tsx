import { Link, useNavigate } from "react-router-dom";
import { Film, Search, Heart, Bookmark, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Film className="h-6 w-6" />
          <span className="font-bold text-xl">CinematicDB</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <nav className="hidden md:flex items-center space-x-4">
                <Link to="/search">
                  <Button variant="ghost" size="icon">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </Link>
                <Link to="/watchlist">
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-4 w-4" />
                    <span className="sr-only">Watchlist</span>
                  </Button>
                </Link>
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email ? getUserInitials(user.email) : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile navigation icons */}
              <nav className="md:hidden flex items-center space-x-2">
                <Link to="/search">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Search className="h-3 w-3" />
                    <span className="sr-only">Search</span>
                  </Button>
                </Link>
                <Link to="/favorites">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Heart className="h-3 w-3" />
                    <span className="sr-only">Favorites</span>
                  </Button>
                </Link>
                <Link to="/watchlist">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="h-3 w-3" />
                    <span className="sr-only">Watchlist</span>
                  </Button>
                </Link>
              </nav>
            </>
          )}
          
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
