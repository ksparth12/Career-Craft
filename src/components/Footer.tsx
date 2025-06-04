import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ExternalLink, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-tertiary/5 border-t-2 border-primary py-12">
      <div className="container mx-auto px-4">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Career Craft</h3>
            <p className="text-muted-foreground text-sm">
              Effortlessly track your job applications and optimize your resume with AI assistance.
            </p>
            <div className="flex space-x-3">
              <a href="mailto:Ksparth12@gmail.com" target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </Button>
              </a>
              <a href="https://github.com/ksparth12" target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                  <Github className="h-4 w-4 text-primary" />
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/ksparth128" target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                  <Linkedin className="h-4 w-4 text-primary" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link to="/resume-analyzer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Me
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Career Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Resume Templates
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center">
                  Help Center <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <a href="mailto:Ksparth12@gmail.com" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Ksparth12@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-tertiary/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Career Craft. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 