import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Moon, Sun, LogOut, FileText, Briefcase, ChevronRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const MotionCard = motion(Card);

const ProfilePage = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [resumeCount, setResumeCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setJobTitle(profile.job_title || "");
      setWebsite(profile.website || "");
    }
    
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // Fetch resume count
        const { data: resumes, error: resumeError } = await supabase
          .from('resumes')
          .select('id')
          .eq('user_id', user.id);
        
        if (!resumeError && resumes) {
          setResumeCount(resumes.length);
        }
        
        // Fetch application count
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select('id')
          .eq('user_id', user.id);
        
        if (!appError && applications) {
          setApplicationCount(applications.length);
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    
    fetchUserStats();
  }, [user, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio,
          location,
          job_title: jobTitle,
          website,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Also update in public_profiles as fallback
      await supabase
        .from('public_profiles')
        .update({
          full_name: fullName,
          bio,
          location,
          job_title: jobTitle,
          website,
          updated_at: new Date()
        })
        .eq('id', user.id);
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Settings className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Profile Card */}
              <motion.div variants={item} className="md:col-span-2">
                <MotionCard className="shadow-sm">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <div className="flex justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" /> My Profile
                      </CardTitle>
                      <Button 
                        variant={isEditing ? "ghost" : "outline"} 
                        size="sm" 
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              placeholder="Your name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                              id="jobTitle"
                              placeholder="Software Engineer"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            placeholder="Tell us about yourself"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                              id="location"
                              placeholder="City, Country"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              placeholder="https://yourwebsite.com"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/10">
                            <AvatarImage src={user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/60 to-secondary/60 text-primary-foreground text-xl">
                              {getInitials(fullName || user?.email?.split('@')[0] || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-semibold">{fullName || user?.email?.split('@')[0] || "Unnamed User"}</h2>
                            <p className="text-muted-foreground">{jobTitle || "No job title"}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                            <p>{user?.email}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                            <p>{location || "Not specified"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                            <p>{website ? <a href={website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{website}</a> : "Not specified"}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Type</h3>
                            <Badge variant="outline" className="capitalize">{profile?.role || "job_seeker"}</Badge>
                          </div>
                        </div>
                        
                        {bio && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Bio</h3>
                            <p>{bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  {isEditing && (
                    <CardFooter className="border-t border-border/40 bg-muted/30 flex justify-end">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={loading}
                        className="gap-2"
                      >
                        {loading ? "Saving..." : (
                          <>
                            <Save className="h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </MotionCard>
              </motion.div>
              
              {/* Stats Card */}
              <motion.div variants={item} className="md:col-span-1">
                <MotionCard className="shadow-sm h-full">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" /> Activity
                    </CardTitle>
                    <CardDescription>
                      Your application statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Resumes</p>
                          </div>
                        </div>
                        <p className="font-bold">{resumeCount}</p>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium">Applications</p>
                          </div>
                        </div>
                        <p className="font-bold">{applicationCount}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/40 bg-muted/30">
                    <Button 
                      variant="outline" 
                      className="w-full gap-1 group" 
                      onClick={() => navigate("/dashboard")}
                    >
                      View Dashboard
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </CardFooter>
                </MotionCard>
              </motion.div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item}>
                <MotionCard className="shadow-sm">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" /> Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your application experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              {theme === 'dark' ? (
                                <Moon className="h-4 w-4 text-primary" />
                              ) : (
                                <Sun className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
                            </div>
                          </div>
                          <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-border/30">
                        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                        <Button 
                          variant="destructive" 
                          className="gap-2"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </MotionCard>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage; 