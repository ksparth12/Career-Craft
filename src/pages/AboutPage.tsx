import React from 'react';
import { Mail, Linkedin, Github } from 'lucide-react';
import HeaderNav from '../components/HeaderNav';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
  return (
    <>
      <HeaderNav />
      <div className="min-h-screen bg-background text-foreground py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-10 sm:mb-12 animate-fadeInUp animation-delay-100">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-3 animate-fadeInUp animation-delay-200">About Me</h1>
          <p className="text-lg text-muted-foreground animate-fadeInUp animation-delay-300">
            Meet the creator of Career Craft.
          </p>
        </header>

        <div className="max-w-3xl mx-auto animate-fadeInUp animation-delay-400">
          <p className="text-xl font-semibold mb-6 text-card-foreground animate-fadeInUp animation-delay-500">
            👋 Hello! I'm Parth Sharma, a passionate and driven Final-Year Computer Science Student at Chandigarh University, on the cusp of launching my career as a Software Engineer.
          </p>

          <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 text-primary transition-colors duration-300 hover:text-primary/80 animate-fadeInUp animation-delay-600">My Journey</h2>
          <p className="text-base sm:text-lg text-card-foreground leading-relaxed mb-4 animate-fadeInUp animation-delay-700">
            With a strong foundation in C++, Data Structures & Algorithms (DSA), and Full-Stack Development, I thrive on solving complex problems and building efficient, scalable solutions. My academic journey has equipped me with hands-on experience in both frontend and backend technologies, and I'm constantly exploring new frameworks and tools to stay ahead in the ever-evolving tech landscape.
          </p>

          <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 text-primary transition-colors duration-300 hover:text-primary/80 animate-fadeInUp animation-delay-700" style={{ animationDelay: '0.8s' }}>What I Do</h2>
          <ul className="list-disc list-inside text-base sm:text-lg text-card-foreground leading-relaxed space-y-2 mb-4 animate-fadeInUp animation-delay-700" style={{ animationDelay: '0.9s' }}>
            <li className="transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-muted/20 rounded pl-1 -ml-1">Develop clean, optimized code with a focus on performance and usability.</li>
            <li className="transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-muted/20 rounded pl-1 -ml-1">Build full-stack web applications using modern technologies.</li>
            <li className="transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-muted/20 rounded pl-1 -ml-1">Solve algorithmic challenges to sharpen my problem-solving skills.</li>
            <li className="transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-muted/20 rounded pl-1 -ml-1">Collaborate on projects that bridge theory and real-world impact.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 text-primary transition-colors duration-300 hover:text-primary/80 animate-fadeInUp animation-delay-700" style={{ animationDelay: '1.0s' }}>Looking Ahead</h2>
          <p className="text-base sm:text-lg text-card-foreground leading-relaxed mb-4 animate-fadeInUp animation-delay-700">
            I'm eager to contribute my skills to innovative tech projects, learn from industry experts, and grow as a versatile developer. Whether it's internships, open-source contributions, or networking with fellow tech enthusiasts—I'm always open to new opportunities!
          </p>

          <h2 className="text-2xl sm:text-3xl font-semibold mt-8 mb-4 text-primary transition-colors duration-300 hover:text-primary/80 animate-fadeInUp animation-delay-700" style={{ animationDelay: '1.1s' }}>Let's Connect!</h2>
          <p className="text-base sm:text-lg text-card-foreground leading-relaxed mb-6">
            If you're as passionate about technology as I am, let's collaborate, share ideas, or just chat about the latest in tech!
          </p>

          <div className="mt-6 border-t border-border/50 pt-6 space-y-4 animate-fadeInUp animation-delay-700" style={{ animationDelay: '1.2s' }}>
            <a href="mailto:Ksparth12@gmail.com" className="flex items-center gap-3 text-lg text-primary hover:text-primary/80 transition-all duration-200 group hover:bg-muted/30 rounded-md p-1 -m-1 group-hover:scale-105">
              <Mail className="h-6 w-6 text-primary/90 group-hover:text-primary/70" />
              <span>Ksparth12@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/ksparth128" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-primary hover:text-primary/80 transition-all duration-200 group hover:bg-muted/30 rounded-md p-1 -m-1 group-hover:scale-105">
              <Linkedin className="h-6 w-6 text-primary/90 group-hover:text-primary/70" />
              <span>linkedin.com/in/ksparth128</span>
            </a>
            <a href="https://github.com/ksparth12" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-lg text-primary hover:text-primary/80 transition-all duration-200 group hover:bg-muted/30 rounded-md p-1 -m-1 group-hover:scale-105">
              <Github className="h-6 w-6 text-primary/90 group-hover:text-primary/70" />
              <span>github.com/ksparth12</span>
            </a>
          </div>
        </div>
      </div>
      </div> {/* Closes min-h-screen content wrapper */}
      <Footer />
    </>
  );
};

export default AboutPage;
