import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { directUserLogin } from "@/utils/directAuth";

interface LoginFormProps {
  onClose: () => void;
}

const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // First try standard login
      console.log("Attempting standard login...");
      const supabaseResponse = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Supabase auth response:", supabaseResponse);
      const { error } = supabaseResponse;

      if (error) {
        console.log("Standard login failed, trying direct login...", error);
        
        // If standard login fails, try direct login
        try {
          const directResult = await directUserLogin(email, password);
          console.log("Direct login result:", directResult);
          
          if (!directResult.success) {
            throw new Error(directResult.error || "Invalid login credentials");
          }
          
          console.log("Direct login successful", directResult.user);
          
          toast({
            title: "Successfully signed in",
            description: "Welcome back! (Direct login)",
          });
          
          onClose();
          navigate("/dashboard");
          return;
        } catch (directError: any) {
          console.error("Direct login error:", directError);
          throw new Error(directError.message || "Failed to log in with direct method");
        }
      }
      
      console.log("Standard login successful");
      toast({
        title: "Successfully signed in",
        description: "Welcome back!",
      });
      
      onClose();
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error signing in",
        description: error.message || "An error occurred during sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => toast({
              title: "Reset password",
              description: "Password reset functionality coming soon!",
            })}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};

export default LoginForm;
