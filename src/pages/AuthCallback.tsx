
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { hash } = window.location;
      
      if (hash) {
        // Handle the redirect from OAuth providers
        await supabase.auth.getSession();
      }

      // Redirect to dashboard after handling the auth callback
      navigate("/dashboard");
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/10">
      <div className="text-center max-w-md px-4">
        <div className="relative mb-8 mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 gradient-text inline-block">Almost there!</h1>
        <p className="text-lg text-tertiary/70 mb-6 animate-pulse">Finalizing your authentication...</p>
        
        <div className="space-y-1">
          <div className="h-1 w-full bg-tertiary/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "70%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
