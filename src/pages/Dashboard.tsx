import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Calendar, File, Check, FileText, Clock, X, ChevronRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import HeaderNav from "@/components/HeaderNav";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    applied: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get application stats
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id);
          
        if (applicationsError) throw applicationsError;
        
        if (applicationsData) {
          setApplications(applicationsData);
          
          // Calculate stats based on status
          const applied = applicationsData.filter(app => app.status === 'applied').length;
          const interviews = applicationsData.filter(app => app.status === 'interview').length;
          const offers = applicationsData.filter(app => app.status === 'offer').length;
          const rejected = applicationsData.filter(app => app.status === 'rejected').length;
          
          setDashboardStats({
            applied,
            interviews,
            offers,
            rejected
          });
        }
      } catch (error: any) {
        toast({
          title: "Error loading dashboard data",
          description: error.message || "Could not load your data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const showFeatureNotification = () => {
    toast({
      title: "Feature Coming Soon",
      description: "This feature is under development.",
      duration: 3000,
    });
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || user?.email?.split('@')[0] || 'there'}!</h1>
            <p className="text-muted-foreground">Track and manage your job applications</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-primary/5 transition-all duration-200"
              onClick={() => navigate("/jobs")}
            >
              <Search className="h-4 w-4" /> Find Jobs
            </Button>
            <Button 
              className="gap-2 hover:bg-primary/80 transition-all duration-200 hover:-translate-y-0.5"
              onClick={showFeatureNotification}
            >
              <Plus className="h-4 w-4" /> Add Application
            </Button>
          </div>
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <StatCard 
              title="Applications" 
              value={dashboardStats.applied} 
              icon={<File />} 
               
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard 
              title="Interviews" 
              value={dashboardStats.interviews} 
              icon={<Calendar />} 
               
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard 
              title="Offers" 
              value={dashboardStats.offers} 
              icon={<Check />} 
               
            />
          </motion.div>
          <motion.div variants={item}>
            <StatCard 
              title="Rejected" 
              value={dashboardStats.rejected} 
              icon={<X />}
               
            />
          </motion.div>
        </motion.div>

        {/* Application Status Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <motion.div variants={item}>
            <StatusCard 
              title="Upcoming Interviews" 
              icon={<Calendar className="h-5 w-5" />}
              onClick={showFeatureNotification}
              
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Practice Interview Skills</p>
                      <p className="text-xs text-muted-foreground">Prepare for technical and behavioral questions</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={showFeatureNotification} className="w-full mt-2 group">
                  Schedule Mock Interview 
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </StatusCard>
          </motion.div>
          
          <motion.div variants={item}>
            <StatusCard 
              title="Resume Analysis" 
              icon={<FileText className="h-5 w-5" />}
              onClick={() => navigate("/resume-analyzer")}
              
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">AI Resume Optimization</p>
                      <p className="text-xs text-muted-foreground">Get tailored feedback for job applications</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/resume-analyzer")} className="w-full mt-2 group">
                  Upload Resume
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </StatusCard>
          </motion.div>
        </motion.div>

        {/* Recent Applications */}
        <MotionCard 
          className="mb-8 bg-card text-card-foreground border border-border/50 shadow-md hover:shadow-lg dark:hover:shadow-primary/10 hover:border-primary/60 transition-all overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CardHeader className="flex flex-row items-center justify-between bg-muted/20 border-b border-border/40">
            <CardTitle className="text-lg flex items-center gap-2">
              <File className="h-5 w-5 text-primary" />
              Recent Applications
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={showFeatureNotification} className="gap-1 group">
              View All <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {applications.length > 0 ? (
              <div className="divide-y divide-border/40">
                {applications.slice(0, 5).map((app, index) => (
                  <ApplicationItem 
                    key={app.id}
                    company="Acme Corporation" // We would need to join with job_listings and companies
                    role="Software Engineer"
                    date={new Date(app.applied_at).toLocaleDateString()}
                    status={app.status}
                    onClick={showFeatureNotification}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <h3 className="text-lg font-medium mb-1">No applications yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Track your job hunt by adding applications to your dashboard</p>
                <Button onClick={showFeatureNotification} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Your First Application
                </Button>
              </div>
            )}
          </CardContent>
        </MotionCard>

        {/* Call to Action */}
        <MotionCard 
          className="bg-card text-card-foreground border border-primary/20 shadow-md hover:shadow-lg dark:hover:shadow-primary/10 hover:border-primary/60 transition-all"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume AI Analysis
                </h3>
                <p className="text-muted-foreground mb-4 md:mb-0">
                  Let our AI analyze your resume and suggest improvements for better job matches.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/resume-analyzer")}
                className="bg-primary hover:bg-primary/80 shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                Analyze Resume
              </Button>
            </div>
          </CardContent>
        </MotionCard>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

const StatCard = ({ title, value, icon, className }: StatCardProps) => {
  return (
    <Card className={`group transition-all duration-300 cursor-pointer bg-card text-card-foreground border border-border/50 hover:bg-muted/30 dark:hover:bg-muted/20 hover:border-primary/60 hover:shadow-lg dark:hover:shadow-primary/10 ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold tracking-tight">
              <AnimatedCounter value={value} />
            </h3>
          </div>
          <div className="p-3 rounded-full bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatusCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const StatusCard = ({ title, icon, children, onClick, className }: StatusCardProps) => {
  return (
    <Card 
      className={`bg-card text-card-foreground border border-border/50 hover:border-primary/70 hover:shadow-xl dark:hover:shadow-primary/15 hover:-translate-y-1 transition-all cursor-pointer group animate-fade-in ${className}`} 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-2 border-b border-border/40 bg-muted/20">
        <div className="p-1.5 rounded-full bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
};

interface ApplicationItemProps {
  company: string;
  role: string;
  date: string;
  status: "applied" | "interview" | "rejected" | "offer";
  onClick: () => void;
}

const ApplicationItem = ({ company, role, date, status, onClick }: ApplicationItemProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "applied": return "bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30";
      case "interview": return "bg-yellow-400/10 text-yellow-500 border border-yellow-400/20 dark:bg-yellow-600/10 dark:text-yellow-500 dark:border-yellow-600/20";
      case "offer": return "bg-green-500/10 text-green-600 border border-green-500/20 dark:bg-green-600/10 dark:text-green-500 dark:border-green-600/20";
      case "rejected": return "bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30";
      default: return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/30";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "applied": return <File className="h-3.5 w-3.5" />;
      case "interview": return <Calendar className="h-3.5 w-3.5" />;
      case "offer": return <Check className="h-3.5 w-3.5" />;
      case "rejected": return <X className="h-3.5 w-3.5" />;
      default: return <Clock className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div 
      className="px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {company.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <h4 className="font-medium">{company}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{date}</span>
        <Badge variant="secondary" className={`flex items-center gap-1 capitalize ${getStatusColor()}`}>
          {getStatusIcon()} {status}
        </Badge>
      </div>
    </div>
  );
};

export default Dashboard;
