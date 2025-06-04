import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Calendar, Clock, DollarSign, FileText, MapPin, Share2, Building, ArrowLeft, BookmarkIcon, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import { toast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  location: string;
  website?: string;
  industry?: string;
  size?: string;
}

interface JobListing {
  id: string;
  title: string;
  company_id: string;
  description: string;
  location: string;
  salary_range?: string;
  job_type?: string;
  experience_level?: string;
  keywords?: string[];
  created_at: string;
  companies: Company;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            companies (*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setJob(data);
        
        // Check if user has already applied
        if (user) {
          const { data: applicationData, error: applicationError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', id)
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (!applicationError && applicationData) {
            setHasApplied(true);
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast({
          title: "Error",
          description: "Could not load job details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    
    if (!job) return;
    
    try {
      setIsApplying(true);
      
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          status: 'applied',
          match_score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100 for demo
        });
        
      if (error) throw error;
      
      setHasApplied(true);
      toast({
        title: "Success!",
        description: "Your application has been submitted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const shareJob = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.companies.name}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Job link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <HeaderNav />
        <div className="container mx-auto px-4 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-tertiary/10 rounded w-3/4 max-w-lg"></div>
            <div className="h-4 bg-tertiary/10 rounded w-1/2 max-w-md"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-tertiary/10 rounded w-32"></div>
              <div className="h-10 bg-tertiary/10 rounded w-32"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-tertiary/10 rounded w-full"></div>
              <div className="h-4 bg-tertiary/10 rounded w-full"></div>
              <div className="h-4 bg-tertiary/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <HeaderNav />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-tertiary/40 mb-4">
            <FileText className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The job listing you're looking for might have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate("/jobs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Listings
          </Button>
        </div>
      </div>
    );
  }

  const datePosted = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <HeaderNav />
      
      <div className="container mx-auto px-4 py-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/jobs")}
          className="mb-6 hover:bg-tertiary/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            <div className="bg-white dark:bg-tertiary/5 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-1 gradient-text inline-block">{job.title}</h1>
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{job.companies.name}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Button variant="outline" onClick={shareJob} className="border-tertiary/20">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="border-tertiary/20">
                    <BookmarkIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {job.job_type && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" /> Job Type
                    </span>
                    <span className="font-medium">{job.job_type}</span>
                  </div>
                )}
                
                {job.salary_range && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1 flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Salary
                    </span>
                    <span className="font-medium">{job.salary_range}</span>
                  </div>
                )}
                
                {job.experience_level && (
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground mb-1 flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> Experience
                    </span>
                    <span className="font-medium">{job.experience_level}</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> Posted
                  </span>
                  <span className="font-medium">{datePosted}</span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                <div className="prose dark:prose-invert max-w-none">
                  {job.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {job.keywords && job.keywords.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-semibold mb-2">Skills & Requirements</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="bg-tertiary/5 border-tertiary/20">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="overflow-hidden border-primary/10">
              <div className="bg-gradient-to-r from-tertiary to-primary p-6 text-white">
                <h2 className="text-xl font-bold mb-1">Ready to Apply?</h2>
                <p className="text-white/80 text-sm">
                  Submit your application now to be considered for this position.
                </p>
              </div>
              <CardContent className="p-6">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto h-12 w-12 text-primary mb-2" />
                    <h3 className="font-semibold text-lg mb-1">Application Submitted</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Your application is under review.
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-tertiary/20"
                      onClick={() => navigate("/dashboard")}
                    >
                      View in Dashboard
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-tertiary to-primary hover:from-primary hover:to-tertiary transition-all duration-500 mb-4 h-12"
                    onClick={handleApply}
                    disabled={isApplying}
                  >
                    {isApplying ? (
                      <>
                        <span className="animate-pulse">Submitting...</span>
                      </>
                    ) : (
                      <>Apply for this position</>
                    )}
                  </Button>
                )}
                
                <div className="text-sm text-muted-foreground text-center">
                  {user ? (
                    <p>Your profile will be shared with the employer.</p>
                  ) : (
                    <p>Sign in to submit your application and track status.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">About {job.companies.name}</h3>
                {job.companies.description ? (
                  <p className="text-sm text-muted-foreground mb-4">{job.companies.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">
                    {job.companies.name} is a leading company in its industry, offering innovative solutions and a great work environment.
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {job.companies.industry && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{job.companies.industry}</span>
                    </div>
                  )}
                  
                  {job.companies.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company size:</span>
                      <span>{job.companies.size}</span>
                    </div>
                  )}
                  
                  {job.companies.website && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Website:</span>
                      <a 
                        href={job.companies.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
};

export default JobDetail;
