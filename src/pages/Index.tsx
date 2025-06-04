import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, FileText, Search, Calendar, Bell, Briefcase, BarChart, Trophy, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthDialog from "@/components/auth/AuthDialog";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeaderNav />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="flex flex-col items-center justify-center text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text-static">
            Smart Job Tracker & Resume Analyzer
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Track your job applications, get AI-powered resume analysis, and find the perfect match for your skills.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-primary to-primary/90 hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 btn-3d animate-pulse"
              onClick={handleGetStarted}
            >
              <span>Get Started</span>
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/jobs")}
              className="border-tertiary/20 hover:border-tertiary/40 hover:bg-tertiary/5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 glow-effect"
            >
              <span>Browse Jobs</span>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24 mt-10 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <StatCard 
            value="100+" 
            label="Companies" 
            icon={<Briefcase className="text-primary animate-float" />} 
            delay={0}
          />
          <StatCard 
            value="500+" 
            label="Job Listings" 
            icon={<Search className="text-primary animate-float" />} 
            delay={0.1}
          />
          <StatCard 
            value="95%" 
            label="Success Rate" 
            icon={<Trophy className="text-primary animate-float" />} 
            delay={0.2}
          />
          <StatCard 
            value="24/7" 
            label="AI Support" 
            icon={<Bot className="text-primary animate-float" />} 
            delay={0.3}
          />
        </div>

        {/* Features Section */}
        <h2 className="text-3xl font-bold text-center mb-10 gradient-text-static inline-block">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={<CheckCircle />} 
            title="Application Tracking" 
            description="Track job applications, interviews, and offers in one place. Never lose track of your job hunt progress."
            onClick={() => user ? navigate("/dashboard") : setIsAuthDialogOpen(true)}
            delay={0}
          />
          <FeatureCard 
            icon={<Search />} 
            title="Job Search" 
            description="Search for relevant job listings from major job boards and save them directly to your tracker."
            onClick={() => navigate("/jobs")}
            delay={0.1}
          />
          <FeatureCard 
            icon={<FileText />} 
            title="Resume Analysis" 
            description="AI-powered resume analysis to match your skills with job requirements and optimize your applications."
            onClick={() => user ? navigate("/resume-analyzer") : setIsAuthDialogOpen(true)}
            delay={0.2}
          />
          <FeatureCard 
            icon={<Calendar />} 
            title="Interview Scheduling" 
            description="Keep track of upcoming interviews and get reminders so you never miss an opportunity."
            onClick={() => user ? navigate("/dashboard") : setIsAuthDialogOpen(true)}
            delay={0.3}
          />
          <FeatureCard 
            icon={<Bell />} 
            title="Smart Notifications" 
            description="Get timely reminders for follow-ups, application deadlines, and interview preparation."
            onClick={() => user ? navigate("/dashboard") : setIsAuthDialogOpen(true)}
            delay={0.4}
          />
          <FeatureCard 
            icon={<BarChart />} 
            title="Application Insights" 
            description="View analytics on your job hunt, identify patterns, and optimize your strategy."
            onClick={() => user ? navigate("/dashboard") : setIsAuthDialogOpen(true)}
            delay={0.5}
          />
        </div>

        {/* Call to Action */}
        <div className="relative rounded-2xl p-10 text-center mt-24 overflow-hidden group animate-fade-in bg-primary text-primary-foreground" style={{ animationDelay: "0.5s" }}>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-primary-foreground">Ready to supercharge your job hunt?</h2>
            <p className="text-lg text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Sign up now to start tracking your job applications and get AI-powered resume analysis.
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              {user ? "Go to Dashboard" : "Create Free Account"}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  );
};

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}

const StatCard = ({ value, label, icon, delay }: StatCardProps) => {
  return (
    <div 
      className="bg-card/70 dark:bg-card/50 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl dark:hover:bg-muted/50 transition-all duration-300 hover:-translate-y-2 border border-border/30 hover:border-primary/50 dark:border-card hover:dark:border-primary/60 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="mb-2">{icon}</div>
      <div className="text-2xl md:text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  delay: number;
}

const FeatureCard = ({ icon, title, description, onClick, delay }: FeatureCardProps) => {
  return (
    <Card 
      className="hover:shadow-lg transition-all group hover:scale-102 cursor-pointer card-hover animate-fade-in rounded-xl border-primary/10 overflow-hidden animate-fade-in-up"
      onClick={onClick}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader>
        <div className="bg-primary/10 p-3 rounded-full w-fit mb-4 text-primary group-hover:scale-110 transition-transform animate-pulse">
          {icon}
        </div>
        <CardTitle className="group-hover:text-primary transition-colors">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="ghost" className="group-hover:text-primary transition-colors hover-underline">
          Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Index;
