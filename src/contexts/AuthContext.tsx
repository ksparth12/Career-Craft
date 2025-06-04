import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Function to fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      // Try the standard profiles table first
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching from profiles table:', error);
        
        // Fall back to public_profiles if there's an error
        const { data: publicData, error: publicError } = await supabase
          .from('public_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (publicError) {
          console.error('Error also fetching from public_profiles:', publicError);
          return null;
        }
        
        console.log('Found profile in public_profiles table:', publicData);
        return publicData as Profile;
      }

      console.log('Found profile in profiles table:', data);
      return data as Profile;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  // Function to refresh the user profile
  const refreshProfile = async () => {
    if (!user) {
      console.warn('Cannot refresh profile: No user is logged in');
      return;
    }
    
    console.log('Refreshing profile for user:', user.id);
    const profileData = await fetchProfile(user.id);
    if (profileData) {
      setProfile(profileData);
      console.log('Profile refreshed successfully');
    } else {
      console.warn('Failed to refresh profile');
    }
  };

  // Handle initial session check
  const checkAndSetSession = async () => {
    setLoading(true);
    setAuthError(null);
    
    try {
      console.log('Checking for existing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error checking session:', error);
        setAuthError(error.message);
        setLoading(false);
        return;
      }
      
      if (data.session) {
        console.log('Session found, setting user state');
        setSession(data.session);
        setUser(data.session.user);
        
        // Fetch profile
        if (data.session.user) {
          const profileData = await fetchProfile(data.session.user.id);
          setProfile(profileData);
        }
      } else {
        console.log('No active session found');
      }
    } catch (err) {
      console.error('Exception during session check:', err);
      setAuthError(err instanceof Error ? err.message : 'Unknown error checking auth state');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually retry authentication
  const retryAuth = async () => {
    await checkAndSetSession();
  };

  // Handle auth state changes
  useEffect(() => {
    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      console.log('Auth state change:', event);
      console.log('Session details:', currentSession ? {
        user: {
          id: currentSession.user.id,
          email: currentSession.user.email,
          isValid: !!currentSession.user
        },
        expires_at: currentSession.expires_at
      } : 'No session');
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Fetch profile when user is signed in
      if (currentSession?.user) {
        const profile = await fetchProfile(currentSession.user.id);
        setProfile(profile);
        console.log('Profile after sign in:', profile);
      } else {
        setProfile(null);
      }

      setLoading(false);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Signed in successfully",
          description: "Welcome back!",
        });
      }
      
      if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out.",
        });
      }
    };

    // Run initial session check
    checkAndSetSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      loading, 
      signOut, 
      refreshProfile,
      retryAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
