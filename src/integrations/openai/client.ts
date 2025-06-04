import OpenAI from 'openai';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Custom type for PDF document initialization parameters
interface PDFDocumentParams {
  data: Uint8Array;
  disableWorker?: boolean;
  disableRange?: boolean;
  disableStream?: boolean;
}

// Set PDF.js worker properly for browser environment
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

// Google Gemini API integration
// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
// Use a model name that works with Gemini 2.0
const MODEL_NAME = "gemini-1.5-flash"; // Changed to a model that should be compatible with Gemini 2.0
// Fallback to OpenRouter for backward compatibility
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

// Initialize the Gemini API client
const initGeminiClient = () => {
  if (!GEMINI_API_KEY) {
    console.log("Gemini API key is not configured, will try OpenRouter if available.");
    return null;
  }
  
  try {
    console.log("Initializing Gemini client with npm package");
    return new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error);
    return null;
  }
};

// Initialize the OpenRouter client as fallback
const createOpenRouterClient = () => {
  if (!OPENROUTER_API_KEY) {
    console.error("Neither Gemini nor OpenRouter API keys are configured. Please add an API key to the .env file.");
    return null;
  }
  
  try {
    // OpenRouter uses OpenAI-compatible API format
    return new OpenAI({
      apiKey: OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1", // OpenRouter endpoint
      defaultHeaders: {
        "HTTP-Referer": window.location.href, // OpenRouter requires this for analytics
        "X-Title": "Resume Analyzer Dashboard" // Optional app name for OpenRouter analytics
      },
      dangerouslyAllowBrowser: true
    });
  } catch (error) {
    console.error("Failed to initialize OpenRouter client:", error);
    return null;
  }
};

// For compatibility, we'll try Gemini first, then fall back to OpenRouter
export const openai = !GEMINI_API_KEY ? createOpenRouterClient() : null;

// Helper function to analyze a resume with Google Gemini or fallback to OpenRouter
export const analyzeResume = async (resumeText: string): Promise<any> => {
  // Ensure we have sufficient resume text
  if (!resumeText || resumeText.trim().length < 50) {
    throw new Error("Insufficient resume text provided. Please ensure your PDF contains extractable text.");
  }

  // Try with Gemini first if API key is available
  if (GEMINI_API_KEY) {
    try {
      console.log("Analyzing resume with Google Gemini 2.0...");
      
      // Initialize Gemini client directly for this call to ensure it's fresh
      const gemini = initGeminiClient();
      
      if (!gemini) {
        console.error("Failed to initialize Gemini client, checking for OpenRouter fallback");
        // Don't throw here, try the fallback instead
        if (OPENROUTER_API_KEY) {
          console.log("Falling back to OpenRouter...");
          return await analyzeResumeWithOpenRouter(resumeText);
        } else {
          throw new Error("Failed to initialize Gemini client and no OpenRouter fallback is configured");
        }
      }
      
      try {
        // Get the model - adapt this for Gemini 2.0
        console.log(`Initializing Gemini model: ${MODEL_NAME}`);
        const model = gemini.getGenerativeModel({ model: MODEL_NAME });
        
        // Define the system prompt for resume analysis
        const systemPrompt = `
          You are an expert ATS (Applicant Tracking System) and resume analyzer with extensive experience in HR and recruitment.
          Analyze the provided resume and provide detailed, actionable feedback in the following areas:
          
          1. Overall ATS score (score out of 100) - This should represent how well the resume would perform in typical ATS systems
          2. Content quality (score out of 100) - Evaluate the quality of the content, experiences, and accomplishments
          3. Formatting and structure (score out of 100) - Evaluate the layout, organization, and readability
          4. Key strengths (3-5 points) - Highlight what's working well in the resume
          5. Areas for improvement (3-5 points) - Identify issues that should be fixed
          6. Suggestions for enhancement (3-5 points) - Provide actionable advice to improve the resume
          7. Skills detected (list of skills found in the resume)
          8. Recommended additional skills based on industry standards
          
          If this doesn't look like a resume, give it a very low score and explain why it's not a proper resume format.
          
          IMPORTANT: FORMAT YOUR RESPONSE AS A VALID JSON OBJECT with the following structure only:
          {
            "overallScore": number,
            "contentScore": number,
            "formatScore": number,
            "keyFindings": [
              { "type": "positive", "title": "string", "description": "string" },
              { "type": "negative", "title": "string", "description": "string" },
              { "type": "suggestion", "title": "string", "description": "string" }
            ],
            "detectedSkills": string[],
            "recommendedSkills": string[]
          }
          
          YOUR ENTIRE RESPONSE MUST BE A VALID JSON OBJECT AND NOTHING ELSE.
        `;
        
        console.log("Generating content with Gemini...");
        
        // Make the API call to Google Gemini
        const result = await model.generateContent({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + resumeText }] }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000
          }
        });
        
        console.log("Gemini response received");
        
        // Parse the response
        const responseText = result.response.text();
        console.log("Raw response:", responseText.substring(0, 100) + "...");
        
        try {
          // Try to find a JSON object in the response if it's not already in JSON format
          const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
          const jsonString = jsonMatch ? jsonMatch[0] : responseText;
          
          return JSON.parse(jsonString);
        } catch (parseError) {
          console.error("Failed to parse Gemini response:", parseError);
          throw new Error("Failed to parse the response from Gemini. Please try again.");
        }
      } catch (modelError) {
        console.error("Error using Gemini model:", modelError);
        
        if (OPENROUTER_API_KEY) {
          console.log("Error with Gemini model, falling back to OpenRouter");
          return await analyzeResumeWithOpenRouter(resumeText);
        }
        
        throw new Error("Failed to use Gemini model: " + (modelError.message || "Unknown error"));
      }
      
    } catch (error: any) {
      // Handle API errors with specific messages
      console.error("Error analyzing resume with Google Gemini:", error);
      
      // If Gemini fails for any reason and we have OpenRouter, try that instead
      if (OPENROUTER_API_KEY) {
        console.log("Falling back to OpenRouter due to Gemini error");
        try {
          return await analyzeResumeWithOpenRouter(resumeText);
        } catch (openRouterError: any) {
          console.error("Both Gemini and OpenRouter failed:", openRouterError);
          throw new Error("Failed to analyze resume with both Gemini and OpenRouter. Please check your API keys and try again.");
        }
      }
      
      throw new Error("Failed to analyze resume: " + (error.message || "Unknown error"));
    }
  } else if (OPENROUTER_API_KEY) {
    // If Gemini is not configured but OpenRouter is, use that
    return await analyzeResumeWithOpenRouter(resumeText);
  } else {
    throw new Error("No API keys configured. Please add your Gemini API key to the .env file as VITE_GEMINI_API_KEY.");
  }
};

// OpenRouter fallback function
const analyzeResumeWithOpenRouter = async (resumeText: string): Promise<any> => {
  // Validate OpenRouter client
  if (!openai) {
    throw new Error("OpenRouter client initialization failed. Please check your OpenRouter API key.");
  }

  try {
    console.log("Analyzing resume with OpenRouter...");
    
    // Define the system prompt (same as above)
    const systemPrompt = `
      You are an expert ATS (Applicant Tracking System) and resume analyzer with extensive experience in HR and recruitment.
      Analyze the provided resume and provide detailed, actionable feedback in the following areas:
      
      1. Overall ATS score (score out of 100) - This should represent how well the resume would perform in typical ATS systems
      2. Content quality (score out of 100) - Evaluate the quality of the content, experiences, and accomplishments
      3. Formatting and structure (score out of 100) - Evaluate the layout, organization, and readability
      4. Key strengths (3-5 points) - Highlight what's working well in the resume
      5. Areas for improvement (3-5 points) - Identify issues that should be fixed
      6. Suggestions for enhancement (3-5 points) - Provide actionable advice to improve the resume
      7. Skills detected (list of skills found in the resume)
      8. Recommended additional skills based on industry standards
      
      If this doesn't look like a resume, give it a very low score and explain why it's not a proper resume format.
      
      Format your response as a valid JSON object with the following structure:
      {
        "overallScore": number,
        "contentScore": number,
        "formatScore": number,
        "keyFindings": [
          { "type": "positive", "title": "string", "description": "string" },
          { "type": "negative", "title": "string", "description": "string" },
          { "type": "suggestion", "title": "string", "description": "string" }
        ],
        "detectedSkills": string[],
        "recommendedSkills": string[]
      }
    `;
    
    // Make the API call to OpenRouter
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.3-8b-instruct:free", // Free version of Llama 3.3 8B Instruct
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: resumeText }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const responseContent = response.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", parseError);
      throw new Error("Failed to parse the response from OpenRouter. Please try again.");
    }
    
  } catch (error: any) {
    // Handle API errors with specific messages
    console.error("Error analyzing resume with OpenRouter:", error);
    
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        throw new Error("Invalid OpenRouter API key. Please check your API key and try again.");
      } else if (status === 429) {
        throw new Error("OpenRouter API rate limit exceeded. Please try again later.");
      } else if (status === 500) {
        throw new Error("OpenRouter service error. Please try again later.");
      }
    }
    
    throw new Error("Failed to analyze resume with OpenRouter: " + (error.message || "Unknown error"));
  }
};

// Properly extract text from PDF files using PDF.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }
  
  if (file.type !== 'application/pdf') {
    throw new Error("Please upload a PDF file.");
  }
  
  if (file.size > 15 * 1024 * 1024) { // 15MB limit
    throw new Error("PDF file is too large. Please upload a smaller file (max 15MB).");
  }
  
  try {
    console.log(`Beginning PDF extraction for ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Failed to read the PDF file. The file may be corrupt.");
    }
    
    // Load the PDF with PDF.js
    try {
      // Configure PDF.js for maximum compatibility
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(`PDF data read, byte length: ${uint8Array.length}`);
      
      const loadingTask = pdfjs.getDocument({
        data: uint8Array,
        disableRange: true,
        disableStream: true,
        isEvalSupported: false
      });

      console.log("PDF.js task created, loading document...");
      
      // Set a reasonable timeout for loading the PDF
      const pdfDoc = await Promise.race([
        loadingTask.promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("PDF loading timed out after 30 seconds")), 30000)
        )
      ]) as PDFDocumentProxy;
      
      if (!pdfDoc) {
        throw new Error("Failed to load PDF document. The file may be corrupted or password-protected.");
      }
      
      console.log(`PDF loaded successfully with ${pdfDoc.numPages} pages`);
      
      if (pdfDoc.numPages === 0) {
        throw new Error("The PDF contains no pages.");
      }
      
      let fullText = '';
      let pagePromises = [];
      
      // Only process a reasonable number of pages to avoid performance issues
      const pagesToProcess = Math.min(pdfDoc.numPages, 30);
      console.log(`Processing ${pagesToProcess} pages...`);
      
      // Create promises for all pages to process them more efficiently
      for (let i = 1; i <= pagesToProcess; i++) {
        pagePromises.push(
          pdfDoc.getPage(i).then(async page => {
            try {
              const textContent = await page.getTextContent();
              if (!textContent || !textContent.items || textContent.items.length === 0) {
                console.warn(`No text content found on page ${i}`);
                return '';
              }
              
              return textContent.items
                .map((item: any) => item.str || '')
                .join(' ');
            } catch (pageError) {
              console.warn(`Error extracting text from page ${i}:`, pageError);
              return ''; // Return empty string if page extraction fails
            }
          }).catch(err => {
            console.warn(`Error getting page ${i}:`, err);
            return ''; // Return empty string if page extraction fails
          })
        );
      }
      
      try {
        // Process all pages in parallel for better performance
        const pageTexts = await Promise.all(pagePromises);
        fullText = pageTexts.join('\n\n');
      } catch (pageProcessingError) {
        console.error("Error processing PDF pages:", pageProcessingError);
        throw new Error("Failed to process PDF pages. The file may be corrupted.");
      }
      
      // Check if we got enough text or if it's likely a scanned document
      if (fullText.trim().length < 200) {
        console.warn("Extracted text is very short, might be a scanned document");
        throw new Error("The PDF appears to be scanned or contains very little extractable text. Please use a PDF that was created digitally and contains selectable text.");
      }
      
      console.log(`Successfully extracted ${fullText.length} characters of text`);
      return fullText;
      
    } catch (error: any) {
      console.error("PDF.js error:", error);
      if (error.message && error.message.includes("timeout")) {
        throw new Error("PDF processing took too long. The file might be too complex or large.");
      } else if (error.message && error.message.includes("password")) {
        throw new Error("The PDF appears to be password-protected. Please upload an unprotected PDF.");
      } else if (error.message && error.message.includes("scanned")) {
        throw new Error("The PDF appears to be scanned. Please upload a PDF that was created digitally and contains selectable text.");
      }
      throw new Error(`Failed to extract text from PDF: ${error.message || "Unknown error"}. Try using a PDF that was created digitally (not scanned) and doesn't have password protection.`);
    }
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    throw error; // Propagate the error with the specific message
  }
};

// Mock analysis results for immediate use
function getMockAnalysisResults() {
  return {
    "overallScore": 85,
    "contentScore": 88,
    "formatScore": 82,
    "keyFindings": [
      {
        "type": "positive",
        "title": "Strong quantifiable achievements",
        "description": "Your resume effectively highlights achievements with metrics and numbers, which is excellent for ATS systems."
      },
      {
        "type": "positive",
        "title": "Clear section headings",
        "description": "The resume has well-defined sections that ATS systems can easily identify and parse."
      },
      {
        "type": "positive",
        "title": "Relevant keywords",
        "description": "You've included industry-specific keywords that align well with typical job descriptions."
      },
      {
        "type": "negative",
        "title": "Complex formatting",
        "description": "Some formatting elements might cause issues with ATS parsing. Simplify tables and columns."
      },
      {
        "type": "negative",
        "title": "Inconsistent date formats",
        "description": "Use consistent date formatting throughout your resume (e.g., MM/YYYY or Month YYYY)."
      },
      {
        "type": "suggestion",
        "title": "Add more technical skills",
        "description": "Include more specific technical skills relevant to your target roles to improve keyword matching."
      },
      {
        "type": "suggestion",
        "title": "Enhance professional summary",
        "description": "Make your summary more impactful by focusing on your unique value proposition and career goals."
      },
      {
        "type": "suggestion",
        "title": "Use more action verbs",
        "description": "Begin bullet points with strong action verbs to better highlight your accomplishments."
      }
    ],
    "detectedSkills": [
      "JavaScript",
      "React",
      "TypeScript",
      "HTML/CSS",
      "Node.js",
      "Git",
      "Agile",
      "UI/UX Design",
      "Problem Solving",
      "Team Leadership"
    ],
    "recommendedSkills": [
      "Next.js",
      "Redux",
      "GraphQL",
      "CI/CD",
      "Docker",
      "Jest",
      "AWS",
      "Performance Optimization",
      "Responsive Design",
      "SEO"
    ]
  };
}

// Fallback function to provide mock resume text for testing purposes
function useMockResumeText(): string {
  return `
  John Smith
  Frontend Developer
  
  Contact:
  Email: john.smith@example.com
  Phone: (123) 456-7890
  LinkedIn: linkedin.com/in/johnsmith
  
  Professional Summary:
  Dedicated Frontend Developer with 6+ years of experience developing and maintaining responsive websites in the recruiting industry. Proficient in HTML, CSS, JavaScript, plus modern libraries and frameworks like React and Next.js.
  
  Skills:
  • HTML5/CSS3/SASS
  • JavaScript/TypeScript
  • React/Redux
  • Next.js
  • Responsive Design
  • UI/UX
  • RESTful APIs
  • Git/GitHub
  • Jest/Testing Library
  • Webpack
  
  Experience:
  Senior Frontend Developer
  TechRecruit Inc. | March 2020 – Present
  • Developed and maintained the company's main job board using React and TypeScript, serving over 50,000 daily visitors
  • Improved site performance by 40% through code splitting and lazy loading techniques
  • Implemented responsive design principles that increased mobile user engagement by 35%
  • Collaborated with UX designers to create intuitive user interfaces, increasing application completion rates by 25%
  • Mentored 3 junior developers through code reviews and pair programming sessions
  
  Frontend Developer
  WebSolutions LLC | January 2017 – February 2020
  • Built and maintained multiple client-facing web applications with React.js
  • Reduced load time by 30% by optimizing assets and implementing efficient caching strategies
  • Integrated RESTful APIs to create dynamic user experiences
  • Participated in Agile development processes, including daily stand-ups and sprint planning
  
  Junior Web Developer
  DigitalCreations Co. | June 2015 – December 2016
  • Assisted in developing and maintaining company website and client projects
  • Converted Photoshop designs to responsive HTML/CSS templates
  • Fixed browser compatibility issues across different platforms
  
  Education:
  Bachelor of Science in Computer Science
  University of Technology | 2011 – 2015
  
  Certifications:
  • Advanced React Patterns, Frontend Masters (2021)
  • UI/UX Design Fundamentals, Interaction Design Foundation (2020)
  • Certified JavaScript Developer, W3Schools (2019)
  `;
} 