import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import RoleSelection from "./RoleSelection";
import SocialAuth from "./SocialAuth";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
  const [selectedTab, setSelectedTab] = useState<"login" | "signup">("login");
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [role, setRole] = useState<"job_seeker" | "company_owner">("job_seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleTabChange = (value: string) => {
    setSelectedTab(value as "login" | "signup");
    setShowRoleSelection(false);
  };

  const handleRoleSelected = (selectedRole: "job_seeker" | "company_owner") => {
    setRole(selectedRole);
    setShowRoleSelection(false);
  };

  const handleSignupNext = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setShowRoleSelection(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <DialogClose className="absolute right-4 top-4 z-10 rounded-full h-6 w-6 flex items-center justify-center bg-secondary hover:bg-secondary/80 transition-colors">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center mb-1">
            {showRoleSelection ? "Select Your Role" : selectedTab === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        {showRoleSelection ? (
          <RoleSelection 
            onRoleSelected={handleRoleSelected} 
            email={email} 
            password={password}
            onBack={() => setShowRoleSelection(false)}
          />
        ) : (
          <div className="p-6 pt-2">
            <Tabs defaultValue="login" value={selectedTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onClose={onClose} />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm onNext={handleSignupNext} />
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <SocialAuth isLogin={selectedTab === "login"} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
