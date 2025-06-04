import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { getDirectUser } from "@/utils/directAuth";
import { motion } from "framer-motion";
import { 
  Building, 
  Users, 
  MapPin, 
  Globe, 
  ArrowLeft, 
  Briefcase, 
  Calendar,
  ExternalLink,
  Clock,
  Info,
  Mail,
  Image
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry?: string;
  location: string;
  size?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  founded?: string;
  created_at: string;
  mission_statement?: string;
  benefits?: string[];
  email?: string;
  gallery_images?: string[];
  banner_image?: string;
}

interface JobListing {
  id: string;
  title: string;
  company_id: string;
  location: string;
  job_type?: string;
  experience_level?: string;
  salary_range?: string;
  description: string;
  created_at: string;
}

const CompanyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const directUser = getDirectUser();
  const userEmail = user?.email || directUser?.email || "";
  const isAdmin = userEmail === "ksparth12@gmail.com";
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [activeTab, setActiveTab] = useState("about");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setIsLoading(true);
      
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (companyError) throw companyError;
      
      if (companyData) {
        setCompany(companyData);
        
        // Fetch jobs for this company
        const { data: jobsData, error: jobsError } = await supabase
          .from("job_listings")
          .select("*")
          .eq("company_id", id)
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;
        
        setJobs(jobsData || []);
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
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

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <HeaderNav />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-tertiary/40 mb-4">
            <Building className="h-16 w-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Company Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The company you're looking for might have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate("/companies")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <HeaderNav />
      <div className="container mx-auto px-4 py-10">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/companies")}
          className="mb-6 hover:bg-tertiary/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Companies
        </Button>
        
        {/* Admin Actions - Only visible to admin */}
        {isAdmin && (
          <div className="flex gap-2 mb-6 animate-fade-in">
            <Button 
              variant="outline" 
              className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800 dark:hover:bg-amber-900/20 flex items-center gap-2"
              onClick={() => alert(`This would open the edit form for ${company.name}`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              Edit Company
            </Button>
            <Button 
              variant="outline" 
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20 flex items-center gap-2"
              onClick={() => alert(`This would open the form to add job for ${company.name}`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase-plus"><path d="M21 6c-1-1-3-1-3-1h-4V3c0-1.5-2.27-1.5-3-1.5S8 1.5 8 3v2H4c-1 0-3 0.5-3 2v11"/><path d="M6 13v-3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4"/><path d="M8 13h8"/><path d="M18 18v5"/><path d="M21 21h-6"/></svg>
              Add Job Listing
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20 flex items-center gap-2"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${company.name}?`)) {
                  alert('Company would be deleted');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              Delete Company
            </Button>
          </div>
        )}
        
        {/* Banner Image */}
        {company.banner_image && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-48 md:h-64 lg:h-80 mb-6 rounded-xl overflow-hidden"
          >
            <img 
              src={company.banner_image} 
              alt={`${company.name} banner`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-tertiary/5 rounded-xl p-6 shadow-sm mb-6 animate-fade-in"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-lg bg-tertiary/10 flex items-center justify-center">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain"
                />
              ) : (
                <Building className="h-10 w-10 md:h-12 md:w-12 text-tertiary" />
              )}
            </div>
            
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold mb-2"
              >
                {company.name}
              </motion.h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {company.industry && (
                  <Badge variant="outline" className="bg-tertiary/5">
                    {company.industry}
                  </Badge>
                )}
                
                {jobs.length > 0 && (
                  <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {jobs.length} Open Position{jobs.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{company.location}</span>
                </div>
                
                {company.size && (
                  <div className="flex gap-2">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span>{company.size}</span>
                  </div>
                )}
                
                {company.website && (
                  <div className="flex gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                    <a
                      href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
                
                {company.founded && (
                  <div className="flex gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span>Founded in {company.founded}</span>
                  </div>
                )}
                
                {company.email && (
                  <div className="flex gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                    <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                      {company.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs */}
        <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="bg-transparent h-auto border-b w-full flex justify-start rounded-none p-0 mb-6">
            <TabsTrigger 
              value="about" 
              className="rounded-none border-b-2 data-[state=active]:border-primary border-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              About
            </TabsTrigger>
            <TabsTrigger 
              value="jobs" 
              className="rounded-none border-b-2 data-[state=active]:border-primary border-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
            >
              Open Positions ({jobs.length})
            </TabsTrigger>
            {company.gallery_images && company.gallery_images.length > 0 && (
              <TabsTrigger 
                value="gallery" 
                className="rounded-none border-b-2 data-[state=active]:border-primary border-transparent data-[state=active]:shadow-none bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-4 py-2"
              >
                <Image className="h-4 w-4 mr-1" />
                Gallery
              </TabsTrigger>
            )}
          </TabsList>
          
          {/* About Tab Content */}
          <TabsContent value="about" className="animate-fade-in">
            {company.description && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-3">About {company.name}</h2>
                <div className="prose dark:prose-invert max-w-none">
                  {company.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            )}
            
            {company.mission_statement && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-3">Mission Statement</h2>
                <div className="bg-tertiary/5 p-4 rounded-lg border border-tertiary/10">
                  <p className="italic text-tertiary">{company.mission_statement}</p>
                </div>
              </motion.div>
            )}
            
            {company.benefits && company.benefits.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold mb-3">Benefits & Perks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {company.benefits.map((benefit, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="flex gap-2 items-start"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <span>{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </TabsContent>
          
          {/* Jobs Tab Content */}
          <TabsContent value="jobs" className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">
              {jobs.length > 0 
                ? `${jobs.length} Open Position${jobs.length > 1 ? "s" : ""} at ${company.name}`
                : `No Open Positions at ${company.name}`
              }
            </h2>
            
            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    key={job.id}
                  >
                    <Link to={`/jobs/${job.id}`}>
                      <Card className="hover:border-primary/30 transition-all hover:shadow-sm hover:-translate-y-0.5">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                              <h3 className="font-semibold">{job.title}</h3>
                              
                              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {job.location}
                                </div>
                                
                                {job.job_type && (
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                                    {job.job_type}
                                  </div>
                                )}
                                
                                {job.experience_level && (
                                  <div className="text-sm text-muted-foreground flex items-center">
                                    <Users className="h-3.5 w-3.5 mr-1" />
                                    {job.experience_level}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {job.salary_range && (
                                <div className="text-sm font-medium">
                                  {job.salary_range}
                                </div>
                              )}
                              
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Posted {formatDate(job.created_at)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-tertiary/5 rounded-lg">
                <Info className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium mb-1">No open positions currently</h3>
                <p className="text-muted-foreground">
                  {company.name} doesn't have any open positions at the moment.
                  Check back later for new opportunities.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Gallery Tab Content */}
          {company.gallery_images && company.gallery_images.length > 0 && (
            <TabsContent value="gallery" className="animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Company Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.gallery_images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="aspect-video rounded-lg overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt={`${company.name} gallery image ${index + 1}`} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default CompanyDetail; 