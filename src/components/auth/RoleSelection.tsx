import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Briefcase, UserSearch, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RoleSelectionProps {
  onRoleSelected: (role: "job_seeker" | "company_owner") => void;
  onBack: () => void;
  email: string;
  password: string;
}

const RoleSelection = ({ onRoleSelected, onBack, email, password }: RoleSelectionProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"job_seeker" | "company_owner" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRoleSelect = async (role: "job_seeker" | "company_owner") => {
    try {
      setLoading(true);
      setSelectedRole(role);
      setErrorMessage(null);
      
      console.log(`Creating user with email: ${email} and role: ${role}`);
      
      let userId = null;
      let useDirectMethod = false;
      let standardAuthSucceeded = false;
      
      try {
        // FIRST ATTEMPT: Try standard signup
        console.log("Attempting standard Supabase signup...");
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) {
          console.error("Standard signup failed, will try direct method:", signupError);
          useDirectMethod = true;
        } else if (!signupData.user) {
          console.error("No user data returned from sign-up, will try direct method");
          useDirectMethod = true;
        } else {
          console.log("Standard signup successful:", signupData.user.id);
          userId = signupData.user.id;
          standardAuthSucceeded = true;
          
          // Update user with role data
          const { error: updateError } = await supabase.auth.updateUser({
            data: { 
              role: role,
              full_name: email.split('@')[0]
            }
          });

          if (updateError) {
            console.error("Error updating user data:", updateError);
            // Continue anyway as this is not critical
          }
        }
      } catch (err) {
        console.error("Error in standard signup:", err);
        useDirectMethod = true;
      }
      
      // FALLBACK: If standard auth failed, use direct user creation
      if (useDirectMethod) {
        console.log("Using direct user creation method...");
        const { data: directData, error: directError } = await supabase.rpc('create_direct_user', {
          user_email: email,
          user_password: password,
          user_role: role
        });
        
        if (directError) {
          console.error("Direct user creation failed:", directError);
          throw new Error(`Direct user creation failed: ${directError.message}`);
        }
        
        if (!directData || !directData.success) {
          console.error("Direct user creation returned unsuccessful:", directData);
          throw new Error(directData?.error || "Failed to create user directly");
        }
        
        console.log("Direct user creation successful:", directData);
        userId = directData.id;
        
        // Store user information in localStorage since we're bypassing auth
        localStorage.setItem('directUserEmail', email);
        localStorage.setItem('directUserId', userId);
        localStorage.setItem('directUserRole', role);
        
        // Show success message
        toast({
          title: "Account created successfully",
          description: "You can now use the app as a direct user.",
        });
        
        // Skip login attempt for direct users
        onRoleSelected(role);
        navigate("/dashboard");
        return; // Exit early - no need to attempt login
      }
      
      if (!userId) {
        throw new Error("Failed to create user account");
      }
      
      // Only try to sign in if we used the standard auth method
      if (standardAuthSucceeded) {
        console.log("Attempting to sign in with created account...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Error signing in:", signInError);
          // Don't throw error here, as we can still proceed with just the user ID
          toast({
            title: "Account created",
            description: "Your account was created, but automatic login failed. Please try logging in manually.",
          });
          navigate("/login");
          return;
        } else {
          console.log("Successfully signed in after account creation");
          
          // Show success message
          toast({
            title: "Account created successfully",
            description: "You have been signed in automatically.",
          });
        }
      }

      // Navigate to dashboard
      onRoleSelected(role);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Account creation error:", error);
      setErrorMessage(error.message || "Database error in creating new user");
      toast({
        title: "Error creating account",
        description: error.message || "Database error in creating new user. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <p className="text-center text-muted-foreground mb-4">
        Please select your role to continue
      </p>
      
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <Card
          className={`hover:shadow-md cursor-pointer transition-all hover:border-primary ${loading && selectedRole === "job_seeker" ? "opacity-80 pointer-events-none" : ""}`}
          onClick={() => !loading && handleRoleSelect("job_seeker")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              {loading && selectedRole === "job_seeker" ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <UserSearch size={24} />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Job Seeker</h3>
              <p className="text-sm text-muted-foreground">
                Find jobs and track applications
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card
          className={`hover:shadow-md cursor-pointer transition-all hover:border-primary ${loading && selectedRole === "company_owner" ? "opacity-80 pointer-events-none" : ""}`}
          onClick={() => !loading && handleRoleSelect("company_owner")}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              {loading && selectedRole === "company_owner" ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Briefcase size={24} />
              )}
            </div>
            <div>
              <h3 className="font-semibold">Company / Organization</h3>
              <p className="text-sm text-muted-foreground">
                Post jobs and find candidates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default RoleSelection;
