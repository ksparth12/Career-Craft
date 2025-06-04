import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getDirectUser, isDirectUserLoggedIn } from "@/utils/directAuth";

interface RouteGuardProps {
  children: ReactNode;
  requireProfile?: boolean;
  requiredRole?: "job_seeker" | "company_owner";
}

export const RouteGuard = ({ children, requireProfile = false, requiredRole }: RouteGuardProps) => {
  const { user, profile, loading, refreshProfile, retryAuth } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      // If still loading auth state, wait
      if (loading) return;
      
      console.log("RouteGuard checking auth:", { user, profile, loading });
      
      // Check for directly created user as fallback
      const directUser = getDirectUser();
      const hasDirectUser = isDirectUserLoggedIn();
      
      // If no user from Supabase auth but we have a direct user, use that
      if (!user && hasDirectUser && directUser) {
        console.log("No Supabase auth user, but found direct user:", directUser);
        // We have a direct user - this is our fallback for production
        // Real production version should sync this with Supabase auth
        setIsChecking(false);
        return;
      }
      
      // If no user from any source, redirect to home
      if (!user && !hasDirectUser) {
        console.warn("No authenticated user found");
        
        // Try to refresh auth before giving up (sometimes session doesn't load properly)
        await retryAuth();
        
        // If we still don't have a user after retry, redirect
        if (!user && !isDirectUserLoggedIn()) {
          toast({
            title: "Authentication required",
            description: "Please sign in to access this page",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
      }
      
      // If profile is required but not loaded yet, try to refresh it
      if (requireProfile && !profile) {
        console.log("Profile required but not loaded, refreshing");
        await refreshProfile();
      }
      
      // If specific role is required, check if user has it
      if (requiredRole) {
        // Check both sources - Supabase profile or direct user
        const roleToCheck = profile?.role || directUser?.role;
        
        if (roleToCheck !== requiredRole) {
          console.warn(`Access restricted: User role ${roleToCheck} doesn't match required ${requiredRole}`);
          toast({
            title: "Access restricted",
            description: `This page is only available to ${requiredRole.replace('_', ' ')}s`,
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }
      }
      
      // All checks passed
      setIsChecking(false);
    };
    
    checkAuth();
  }, [user, profile, loading, navigate, requireProfile, requiredRole, refreshProfile, retryAuth]);

  if (loading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background to-secondary/10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-tertiary rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-700 animate-pulse"></div>
          <Loader2 className="animate-spin h-12 w-12 text-primary relative z-10" />
        </div>
        <p className="mt-4 text-lg animate-pulse">Loading your profile...</p>
        <div className="mt-8 w-64 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse animate-gradient-shift w-2/3"></div>
        </div>
      </div>
    );
  }

  // If no standard auth user but we have a direct user, still allow access
  if (!user && !isDirectUserLoggedIn()) {
    return null;
  }

  return <div className="animate-fade-in">{children}</div>;
};

export default RouteGuard;
