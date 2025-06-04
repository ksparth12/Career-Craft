import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { directUserLogin } from "@/utils/directAuth";

interface SocialAuthProps {
  isLogin: boolean;
}

const SocialAuth = ({ isLogin }: SocialAuthProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    // Reset loading state when the isLogin prop changes
    setIsLoading(false);
    setShowEmailFallback(false);
  }, [isLogin]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Get the current URL origin for the redirect
      const redirectUrl = `${window.location.origin}/auth-callback`;
      console.log("Redirecting to:", redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) {
        console.error("Google auth error:", error);
        
        // Show email fallback when OAuth fails
        if (error.message.includes("Unsupported provider") || 
            error.message.includes("missing OAuth secret")) {
          setShowEmailFallback(true);
          setIsLoading(false);
          toast({
            title: "OAuth Not Configured",
            description: "Please use the direct login method below instead.",
          });
          return;
        }
        
        throw error;
      }
      
      // Successful auth should redirect, but just in case
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google Sign-in Failed",
        description: error.message || "Unable to sign in with Google. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
      
      // Show email fallback for any Google sign-in errors
      setShowEmailFallback(true);
    }
  };

  const handleDirectLogin = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = directUserLogin(email);
      if (success) {
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
        });
        // Refresh the page to update authentication state
        window.location.reload();
      }
    } catch (error) {
      console.error("Direct login error:", error);
      toast({
        title: "Login Failed",
        description: "Unable to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!showEmailFallback ? (
        <>
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-tertiary/20"></div>
            <span className="px-4 text-xs text-muted-foreground">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-tertiary/20"></div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full relative overflow-hidden group border-primary/20 hover:border-primary/60 card-hover"
              disabled={isLoading}
            >
              <div className="absolute inset-0 w-full h-full transition-all duration-300 scale-0 group-hover:scale-100 group-hover:bg-primary/5 rounded-md"></div>
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 text-primary group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Connecting...
                  </span>
                ) : (
                  "Google"
                )}
              </div>
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-tertiary/20"></div>
            <span className="px-4 text-xs text-muted-foreground">USE DIRECT LOGIN</span>
            <div className="flex-grow border-t border-tertiary/20"></div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <Button
              type="button"
              onClick={handleDirectLogin}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Logging in...
                </span>
              ) : (
                "Continue with Email"
              )}
            </Button>

            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowEmailFallback(false)}
              className="w-full text-sm"
              disabled={isLoading}
            >
              Back to other options
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default SocialAuth;
