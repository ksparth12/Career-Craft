import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, Briefcase, Search, Menu, X, Lightbulb, LightbulbOff, Rocket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthDialog from "./auth/AuthDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { isDirectUserLoggedIn, getDirectUser, directUserLogout } from "@/utils/directAuth";

const HeaderNav = () => {
  const { user, profile, signOut } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check both standard auth and direct user auth
  const directUser = getDirectUser();
  const isAuthenticated = !!user || isDirectUserLoggedIn();
  
  // Debug authentication state
  useEffect(() => {
    console.log("Auth state in HeaderNav:", { 
      user: user ? { id: user.id, email: user.email } : null,
      directUser,
      isAuthenticated
    });
  }, [user, isAuthenticated]);

  useEffect(() => {
    // Close mobile menu when changing routes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    // Handle both standard and direct user logout
    await signOut();
    directUserLogout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Get display name from either standard user or direct user
  const displayName = user?.user_metadata?.full_name || 
                      profile?.full_name ||
                      directUser?.email?.split('@')[0] ||
                      user?.email?.split('@')[0] || 
                      "User";

  // Get email from either standard user or direct user
  const userEmail = user?.email || directUser?.email || "";
  
  // Check if current user is admin
  const isAdmin = userEmail === "ksparth12@gmail.com";

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl gradient-text-static">
              Career Craft
            </span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Find Jobs
              </Link>
              <Link to="/companies" className="text-sm font-medium hover:text-primary transition-colors">
                Companies
              </Link>
              <Link to="/resume-analyzer" className="text-sm font-medium hover:text-primary transition-colors">
                Resume Analyzer
              </Link>
              <Link to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                My Profile
              </Link>
              {isAdmin && (
                <Link to="/companies" className="text-sm font-medium bg-primary/10 px-3 py-1 rounded-md text-primary hover:bg-primary/20 transition-colors">
                  Admin Panel
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/jobs" className="text-sm font-medium hover:text-primary transition-colors">
                Browse Jobs
              </Link>
              <Link to="/companies" className="text-sm font-medium hover:text-primary transition-colors">
                Companies
              </Link>
              <Link to="/resume-analyzer" className="text-sm font-medium hover:text-primary transition-colors">
                Resume Tools
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="relative overflow-hidden group"
            aria-label="Toggle theme"
          >
            <div className="absolute inset-0 rounded-full bg-primary/10 scale-0 transition-transform duration-300 group-hover:scale-100"></div>
            {theme === "dark" ? (
              <Lightbulb className="h-5 w-5 text-yellow-400 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            ) : (
              <LightbulbOff className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
            )}
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-primary/10 hover:border-primary/30 transition-all">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/60 to-secondary/60 text-primary-foreground">
                      {displayName ? getInitials(displayName) : userEmail?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {displayName}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer">
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer">
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer">
                  <Link to="/resume-analyzer">Resume Tools</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer">
                  <Link to="/companies">Companies</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer font-semibold text-primary">
                      <Link to="/companies">Manage Companies</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="transition-colors hover:bg-primary/5 cursor-pointer font-semibold text-primary">
                      <Link to="/jobs">Manage Jobs</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleSignOut}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setIsAuthDialogOpen(true)}
                className="hover:bg-primary/5 transition-colors"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setIsAuthDialogOpen(true)}
                className="hover:bg-primary/80 transition-colors hover:-translate-y-0.5 active:translate-y-0 transform transition-transform"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-4 border-t animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/jobs"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Jobs
                </Link>
                <Link
                  to="/companies"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Companies
                </Link>
                <Link
                  to="/resume-analyzer"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Resume Analyzer
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/jobs"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/companies"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Companies
                </Link>
                <Link
                  to="/resume-analyzer"
                  className="text-sm font-medium hover:text-primary px-4 py-2 hover:bg-muted rounded-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Resume Tools
                </Link>
                <div className="pt-2 pb-2">
                  <Button
                    className="w-full transition-all hover:-translate-y-0.5 active:translate-y-0"
                    onClick={() => {
                      setIsAuthDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}

      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </header>
  );
};

export default HeaderNav;
