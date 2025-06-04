
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Search, MapPin, DollarSign, Clock, Building, Filter, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  location: string;
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
  created_at: string;
  companies: Company;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_listings')
          .select(`
            *,
            companies (
              id, 
              name,
              logo_url,
              location
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setJobs(data || []);
        setFilteredJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredJobs(filtered);
    }
  }, [searchTerm, jobs]);

  const handleApply = (jobId: string) => {
    if (!user) {
      setIsAuthDialogOpen(true);
      return;
    }
    // For now, just navigate to dashboard
    navigate(`/job/${jobId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <HeaderNav />
      
      {/* Hero Section */}
      <div className="bg-primary py-10 md:py-16 px-4 animate-fade-in">
        <div className="container mx-auto text-center text-primary-foreground">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto mb-8">
            Browse through hundreds of opportunities matched to your skills and experience
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Job title, company, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/95 dark:bg-slate-800 border-none shadow-md transition-all duration-300 focus:shadow-lg"
                />
              </div>
              <Button type="submit" className="h-12 px-8 bg-white text-primary hover:bg-white/90 shadow-md">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Job Listings */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isLoading ? "Loading jobs..." : `${filteredJobs.length} Jobs Available`}
          </h2>
          <Button variant="outline" className="border-tertiary/20">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse border-primary/10">
                <CardHeader>
                  <div className="h-4 bg-tertiary/10 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-tertiary/10 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-tertiary/10 rounded w-full mb-2"></div>
                  <div className="h-3 bg-tertiary/10 rounded w-full mb-2"></div>
                  <div className="h-3 bg-tertiary/10 rounded w-3/4"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-8 bg-tertiary/10 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-tertiary/40 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse all available positions.
            </p>
            <Button onClick={() => setSearchTerm("")}>
              View all jobs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onApply={() => handleApply(job.id)} 
                delay={index * 0.05}
              />
            ))}
          </div>
        )}
      </div>
      
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
};

interface JobCardProps {
  job: JobListing;
  onApply: () => void;
  delay: number;
}

const JobCard = ({ job, onApply, delay }: JobCardProps) => {
  const datePosted = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 card-hover animate-fade-in rounded-xl"
      style={{ animationDelay: `${delay}s` }}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-tertiary/10 p-2 rounded-full mr-3">
              <Building className="h-5 w-5 text-tertiary" />
            </div>
            <div>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription>{job.companies.name}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-primary/70" />
            <span>{job.location}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary/70" />
              <span>{job.salary_range}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary/70" />
            <span>Posted on {datePosted}</span>
          </div>
          {job.job_type && (
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-primary/70" />
              <span>{job.job_type}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onApply} 
          className="w-full group bg-gradient-to-r from-tertiary to-primary hover:from-primary hover:to-tertiary transition-all duration-500"
        >
          <span>Apply Now</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Jobs;
