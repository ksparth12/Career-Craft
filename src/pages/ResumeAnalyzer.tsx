import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileUp, CheckCircle, XCircle, AlertCircle, FileText, 
  ThumbsUp, ArrowRight, Target, Award, ScanSearch, Shield,
  ScanLine, Info, RefreshCw, FileCheck
} from "lucide-react";
import HeaderNav from "@/components/HeaderNav";
import { RouteGuard } from "@/components/RouteGuard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { analyzeResume, extractTextFromPDF } from "@/integrations/openai/client";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Fix for toast variant
const toastWarning = "destructive";

interface ScoreCardProps {
  score: number;
  label: string;
  description: string;
}

const ScoreCard = ({ score, label, description }: ScoreCardProps) => {
  const getColorClass = (value: number) => {
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <div className="bg-tertiary/5 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{label}</h3>
        <span className={`text-xl font-bold ${getColorClass(score)}`}>{score}%</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <Progress value={score} className="h-2" />
    </div>
  );
};

type FindingType = 'positive' | 'negative' | 'suggestion';

interface Finding {
  type: FindingType;
  title: string;
  description: string;
}

interface FindingProps {
  finding: Finding;
}

const FindingCard = ({ finding }: FindingProps) => {
  const iconMap = {
    positive: CheckCircle,
    negative: XCircle,
    suggestion: AlertCircle,
  };
  
  const colorMap: Record<FindingType, string> = {
    positive: "text-green-500 bg-green-50 dark:bg-green-900/20",
    negative: "text-red-500 bg-red-50 dark:bg-red-900/20",
    suggestion: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
  };
  
  const Icon = iconMap[finding.type];
  
  return (
    <div className="flex p-3 rounded-lg hover:shadow-sm transition-shadow">
      <div className={`rounded-full p-1 mr-3 ${colorMap[finding.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium mb-1">{finding.title}</p>
        <p className="text-sm text-muted-foreground">{finding.description}</p>
      </div>
    </div>
  );
};

interface AnalysisResults {
  overallScore: number;
  contentScore: number;
  formatScore: number;
  keyFindings: Finding[];
  detectedSkills: string[];
  recommendedSkills: string[];
}

const ResumeAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setError(null);
      setIsScannedPdf(false);
      
      if (uploadedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(uploadedFile);
      setAnalysisResults(null);
      setExtractedText("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setAnalyzeProgress(0);
    setError(null);
    setIsScannedPdf(false);
    
    try {
      // Start progress animation
      const interval = setInterval(() => {
        setAnalyzeProgress(prev => {
          return prev < 80 ? prev + 10 : 80;
        });
      }, 200);
      
      // Extract text from PDF if not using mock data
      let resumeText = "";
      
      if (useMockData) {
        console.log("Using mock resume data");
        resumeText = "mock resume text"; // The OpenAI function will use sample data
        setAnalyzeProgress(50);
      } else {
        try {
          console.log("Extracting text from PDF");
          setAnalyzeProgress(30);
          resumeText = await extractTextFromPDF(file);
          setAnalyzeProgress(60);
          
          console.log("Successfully extracted text:", resumeText.substring(0, 100) + "...");
          setExtractedText(resumeText);
        } catch (error: any) {
          console.error("PDF extraction error:", error);
          clearInterval(interval);
          setIsAnalyzing(false);
          setAnalyzeProgress(0);
          
          // Don't automatically switch to mock data, show specific error
          setError(error.message || "Failed to extract text from your PDF.");
          
          toast({
            title: "PDF Extraction Failed",
            description: error.message || "Failed to extract text from your PDF. Please try a different PDF file.",
            variant: "destructive",
          });
          return;
        }
      }
      
      try {
        // Analyze the resume with OpenAI
        console.log("Sending to OpenAI for analysis");
        const results = await analyzeResume(resumeText);
        
        // Complete the progress
        clearInterval(interval);
        setAnalyzeProgress(100);
        
        // Set the results
        setTimeout(() => {
          setAnalysisResults(results);
          setIsAnalyzing(false);
          
          toast({
            title: "Analysis Complete",
            description: "Your resume has been analyzed successfully!",
          });
        }, 500);
        
      } catch (error: any) {
        clearInterval(interval);
        console.error("Resume analysis error:", error);
        setIsAnalyzing(false);
        setAnalyzeProgress(0);
        
        // Show specific OpenAI-related error
        setError(error.message || "There was an error analyzing your resume with OpenAI.");
        
        toast({
          title: "Analysis Failed",
          description: error.message || "There was an error analyzing your resume. Please check your OpenAI API key.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Handle any other errors
      console.error("Unexpected error:", error);
      setIsAnalyzing(false);
      setAnalyzeProgress(0);
      
      toast({
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setError(null);
      setIsScannedPdf(false);
      
      if (droppedFile.type !== 'application/pdf') {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(droppedFile);
      setAnalysisResults(null);
      setExtractedText("");
    }
  };

  return (
    <RouteGuard>
      <div className="min-h-screen bg-white dark:bg-black">
        <HeaderNav />
        
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-primary glow-primary-md inline-block">Resume Analyzer</h1>
            <p className="text-muted-foreground mb-10">
              Upload your resume to get AI-powered feedback and ATS scoring to improve your chances of getting hired.
            </p>
            
            {!analysisResults ? (
              <Card className="border-primary/10 overflow-hidden animate-fade-in">
                <div className="bg-primary p-6 text-primary-foreground">
                  <h2 className="text-xl font-bold mb-1">Upload Your Resume</h2>
                  <p className="text-white/80">
                    We'll analyze your resume and provide personalized feedback and ATS scoring to help you stand out.
                  </p>
                </div>
                <CardContent className="p-6 dark:bg-black">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${file ? 'border-primary/40 bg-primary/5' : 'border-tertiary/20 hover:border-tertiary/40'}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {file ? (
                      <div className="animate-fade-in">
                        <CheckCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                        <p className="font-medium mb-1">{file.name}</p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setFile(null)}
                          className="border-tertiary/20"
                        >
                          Change file
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium mb-1">Drag and drop your resume here</p>
                        <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                        <input
                          type="file"
                          accept=".pdf"
                          id="resume-upload"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('resume-upload')?.click()}
                          className="border-tertiary/20"
                        >
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-2" />
                        <div>
                          <h4 className="font-medium text-red-700 dark:text-red-400">Error Processing Request</h4>
                          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                          <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-2">
                            {error.includes("API key") ? (
                              <>
                                Please make sure your OpenRouter API key is correctly set in the .env file as
                                <code className="mx-1 px-1 py-0.5 bg-red-100 dark:bg-red-900/40 rounded font-mono">VITE_OPENROUTER_API_KEY</code>
                                and restart the application.
                              </>
                            ) : (
                              "Try using a PDF that was created digitally (not scanned) and doesn't have password protection."
                            )}
                          </p>
                          
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => window.open("https://openrouter.ai/keys", "_blank")}
                            className="mt-3 text-red-600 border-red-300"
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Get OpenRouter API Key
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2" />
                      <div>
                        <h4 className="font-medium text-amber-700 dark:text-amber-400">PDF Requirements</h4>
                        <p className="text-sm text-amber-600 dark:text-amber-300">
                          For best results, please upload a digitally created PDF (not scanned) without password protection.
                          Make sure your PDF is text-based and not image-based for accurate ATS scoring.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 my-4 border border-gray-200 dark:border-gray-800 p-3 rounded-md bg-gray-50 dark:bg-gray-900/50">
                    <Switch 
                      id="use-mock-data" 
                      checked={useMockData}
                      onCheckedChange={setUseMockData}
                    />
                    <Label htmlFor="use-mock-data" className="cursor-pointer flex items-center">
                      <FileCheck className="h-4 w-4 mr-2 text-primary" />
                      <div>
                        <span className="font-medium">Use sample resume (testing only)</span>
                        <p className="text-xs text-muted-foreground">
                          This bypasses Meta Llama 3.3 API and uses pre-generated results for testing
                        </p>
                      </div>
                    </Label>
                  </div>
                  
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={!file || isAnalyzing}
                    className="w-full h-12 bg-primary text-primary-foreground border border-primary hover:bg-primary/90 dark:bg-black dark:text-primary dark:hover:bg-primary dark:hover:text-primary-foreground transition-colors duration-300"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="mr-2">Analyzing</span>
                        <Progress value={analyzeProgress} className="w-20 h-2" />
                      </>
                    ) : (
                      <>Analyze Resume</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white dark:bg-tertiary/5 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Resume Analysis Results</h2>
                        <p className="text-sm text-muted-foreground">Based on AI review of your resume</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setAnalysisResults(null)}>
                      Analyze Another
                    </Button>
                  </div>
                  
                  {/* Scanned PDF Warning */}
                  {isScannedPdf && (
                    <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <ScanLine className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-amber-700 dark:text-amber-400 text-lg">Scanned PDF Detected</h3>
                          <p className="text-amber-600 dark:text-amber-300 mt-1">
                            We couldn't extract specific content from your PDF as it appears to be a scanned document.
                            The following analysis contains general ATS advice rather than personalized feedback.
                            For accurate analysis, please upload a digitally created resume.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {useMockData && !isScannedPdf && (
                    <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                        <div>
                          <h3 className="font-medium text-blue-700 dark:text-blue-400 text-lg">Sample Resume Analysis</h3>
                          <p className="text-blue-600 dark:text-blue-300 mt-1">
                            This analysis is based on a sample professional resume template rather than your actual PDF.
                            The feedback provided can still help you understand what makes a resume ATS-friendly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* ATS Score Card */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <ScanSearch className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-medium">ATS Compatibility Score</h3>
                    </div>
                    <div className="bg-card dark:bg-black rounded-lg p-6 border border-primary">
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          {isScannedPdf ? (
                            <div className="h-32 w-32 flex items-center justify-center">
                              <ScanLine className="h-14 w-14 text-amber-500/80" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white dark:bg-gray-800 rounded-full h-10 w-10 flex items-center justify-center">
                                  <span className="text-amber-500 font-bold text-lg">?</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <svg viewBox="0 0 100 100" className="h-32 w-32">
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                className="text-muted/20 dark:text-gray-700" 
                              />
                              <circle 
                                cx="50" cy="50" r="45" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="8" 
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * analysisResults.overallScore / 100)} 
                                className={`text-primary transform -rotate-90 origin-center transition-all duration-1000 ease-out`}
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              {!isScannedPdf && (
                                <>
                                  <div className="text-3xl font-bold text-foreground dark:text-primary-foreground">{analysisResults.overallScore}%</div>
                                  <div className="text-xs text-muted-foreground dark:text-primary-foreground/80">ATS Score</div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-center max-w-md text-sm text-foreground/90 dark:text-primary-foreground/90">
                          {isScannedPdf 
                            ? "We couldn't calculate an ATS score for your scanned PDF. The advice below is general guidance."
                            : "This score indicates how well your resume might perform in Applicant Tracking Systems. Higher scores suggest better keyword optimization and formatting."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!isScannedPdf && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <ScoreCard 
                        score={analysisResults.contentScore}
                        label="Content Quality"
                        description="Measures the quality and impact of your experience descriptions and achievements"
                      />
                      <ScoreCard 
                        score={analysisResults.formatScore}
                        label="Format & Structure"
                        description="Evaluates the layout, organization and consistency of your resume"
                      />
                    </div>
                  )}

                  <Separator className="my-8" />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-medium">Key Strengths</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisResults.keyFindings
                          .filter(finding => finding.type === 'positive')
                          .map((finding, index) => (
                            <FindingCard key={`positive-${index}`} finding={finding} />
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-medium">Areas to Improve</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisResults.keyFindings
                          .filter(finding => finding.type === 'negative')
                          .map((finding, index) => (
                            <FindingCard key={`negative-${index}`} finding={finding} />
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-medium">Suggestions</h3>
                      </div>
                      <div className="space-y-3">
                        {analysisResults.keyFindings
                          .filter(finding => finding.type === 'suggestion')
                          .map((finding, index) => (
                            <FindingCard key={`suggestion-${index}`} finding={finding} />
                          ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-primary/5 dark:bg-black rounded-lg p-5 border border-primary">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Skills Detected</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.detectedSkills.map((skill, index) => (
                          <Badge key={`skill-${index}`} variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/80">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-primary/5 dark:bg-black rounded-lg p-5 border border-primary">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">Recommended Skills</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysisResults.recommendedSkills.map((skill, index) => (
                          <Badge key={`rec-skill-${index}`} variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/80">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </RouteGuard>
  );
};

export default ResumeAnalyzer;