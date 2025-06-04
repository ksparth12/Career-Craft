# Career Craft - Smart Job Tracker & Resume Analyser

![Career Craft](./public/logo.svg) <!-- Make sure you have a logo at public/logo.svg or update the path -->

## Table of Contents

1.  [Overview](#overview)
2.  [Key Features](#key-features)
3.  [Tech Stack](#tech-stack)
4.  [Project Structure](#project-structure)
5.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)
    *   [Environment Variables](#environment-variables)
    *   [Running the Application](#running-the-application)
6.  [Usage](#usage)
7.  [Deployment](#deployment)
8.  [Troubleshooting](#troubleshooting)
9.  [Future Enhancements](#future-enhancements)
10. [Contact](#contact)
11. [Contributing](#contributing)
12. [License](#license)

## Overview

Career Craft is a modern, intuitive web application designed to empower job seekers by providing intelligent tools for comprehensive job tracking and insightful resume analysis. The primary goal of Career Craft is to streamline the often-chaotic job application process, enabling users to present their most polished selves to potential employers and meticulously manage their job search journey from start to finish.

This project is built with a forward-thinking tech stack, emphasizing a responsive, high-performance, and exceptionally user-friendly experience. It aims to be a reliable companion for anyone navigating the competitive job market.

## Key Features

*   **Smart Job Tracking Dashboard**:
    *   Log and categorize job applications with details like company name, job title, application date, status (e.g., Applied, Interviewing, Offer, Rejected), salary, location, and notes.
    *   Visually track progress through different stages of the application pipeline.
    *   Set reminders for follow-ups or interview dates.
*   **AI-Powered Resume Analysis** (via `ResumeAnalyzer.tsx`):
    *   Upload resumes (e.g., PDF, DOCX) for automated analysis.
    *   Receive feedback on keywords, formatting, action verbs, and potential ATS compatibility issues.
    *   Get suggestions for improvement to tailor resumes for specific job descriptions.
    *   (Potentially) Score the resume based on various metrics.
*   **Interactive User Dashboard**:
    *   A personalized central hub displaying key statistics: number of applications, upcoming interviews, recent activity.
    *   Quick access to recently viewed jobs or resume analysis reports.
*   **Responsive & Accessible Design**:
    *   The user interface is crafted to be fully responsive, ensuring a seamless experience across desktops, tablets, and mobile devices.
    *   Adherence to accessibility best practices for use by a wider audience.
*   **Dark Mode**:
    *   A visually appealing and comfortable dark theme for users who prefer it or work in low-light environments, reducing eye strain.
*   **Engaging User Interface**:
    *   Utilizes subtle animations and transitions to enhance user interaction without being distracting.
    *   Clean and modern aesthetic built with Shadcn UI components.
*   **(Potential) User Authentication & Data Persistence**:
    *   Secure user registration and login functionality (e.g., via Supabase Auth).
    *   Persistent storage of user data, including tracked jobs and resume analysis history, linked to their account.
*   **(Potential) Job Discovery & Integration**:
    *   Features to search for job listings from external APIs or platforms.
    *   Ability to directly save interesting job postings to the tracker.

## Tech Stack

*   **Frontend Framework**: React 18 - A popular JavaScript library for building dynamic user interfaces with a component-based architecture.
*   **Language**: TypeScript - Adds static typing to JavaScript, improving code quality, maintainability, and developer experience by catching errors early.
*   **Build Tool**: Vite - A next-generation frontend build tool offering extremely fast Hot Module Replacement (HMR) for rapid development and optimized builds.
*   **Styling**: Tailwind CSS - A utility-first CSS framework for rapidly building custom user interfaces directly in your markup.
*   **UI Components**: Shadcn UI - A collection of beautifully designed, accessible, and customizable React components built on top of Radix UI and Tailwind CSS.
*   **Icons**: Lucide React - A comprehensive and simply beautiful open-source icon library.
*   **Routing**: React Router DOM (v6) - Enables client-side routing for building single-page applications (SPAs) with navigable views.
*   **Animations**: Custom CSS animations and transitions. (Framer Motion could be integrated for more complex physics-based animations if needed).
*   **Backend & Database (if integrated)**: Supabase - An open-source Firebase alternative providing a PostgreSQL database, authentication, real-time subscriptions, and storage, all accessible via APIs.
*   **Linting/Formatting**: ESLint & Prettier - Tools to enforce code style consistency and catch common errors, ensuring a clean and readable codebase.

## Project Structure

The project follows a standard feature-oriented structure to keep code organized and maintainable:

```
career-craft/
├── public/                 # Static assets (e.g., logo.svg, favicons, manifest.json)
├── src/                    # Main source code directory
│   ├── assets/             # Static assets like images, fonts used within components
│   ├── components/         # Reusable UI components shared across the application
│   │   ├── ui/             # Core Shadcn UI components (Button, Card, Input, etc.)
│   │   └── custom/         # Application-specific custom components (e.g., HeaderNav, Footer, StatCard, JobForm)
│   ├── contexts/           # React Context API providers for global state management (e.g., ThemeContext, AuthContext)
│   ├── hooks/              # Custom React hooks for reusable logic (e.g., useAuth, useTheme)
│   ├── lib/                # Utility functions, helper scripts, and library configurations (e.g., utils.ts for cn(), date formatting)
│   ├── pages/              # Top-level page components, each representing a distinct route/view (e.g., DashboardPage, JobsPage, ResumeAnalyzerPage, AboutPage)
│   ├── services/           # Modules for interacting with external APIs or backend services (e.g., supabaseClient.ts, api.ts)
│   ├── styles/             # Global CSS styles, Tailwind CSS base/components/utilities configuration (index.css)
│   ├── types/              # TypeScript type definitions and interfaces shared across the project
│   ├── App.tsx             # Root application component: sets up routing, global providers
│   └── main.tsx            # Application entry point: renders the root component into the DOM
├── .env                    # Local environment variables (ignored by Git)
├── .env.example            # Example environment variables file for contributors
├── .eslintrc.cjs           # ESLint configuration file
├── .gitignore              # Specifies intentionally untracked files that Git should ignore
├── .prettierrc.json        # Prettier configuration file
├── index.html              # Main HTML template file used by Vite
├── package.json            # Project metadata, dependencies, and npm scripts
├── postcss.config.js       # PostCSS configuration (required by Tailwind CSS)
├── tailwind.config.js      # Tailwind CSS theme and plugin configuration
├── tsconfig.json           # TypeScript compiler options for the project
├── tsconfig.node.json      # TypeScript configuration for Node.js specific files (like Vite config)
└── vite.config.ts          # Vite build tool configuration file
```

## Getting Started

Follow these instructions to get a local copy of Career Craft up and running on your machine for development and testing purposes.

### Prerequisites

Ensure you have the following software installed on your system:

*   **Node.js**: Version 18.x or later is recommended. You can download it from [nodejs.org](https://nodejs.org/).
*   **npm**: Version 9.x or later (usually comes with Node.js) or **yarn** (Version 1.22.x or later).
*   **Git**: For cloning the repository.

### Installation

1.  **Clone the repository:**
    Open your terminal and run the following command (replace `<your-repository-url>` with the actual URL if you've forked it):
    ```bash
    git clone <your-repository-url>
    cd smart-job-tracker-and-resume-analyser 
    # Or your chosen project directory name, e.g., career-craft
    ```

2.  **Install project dependencies:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    npm install
    ```
    Alternatively, if you prefer using yarn:
    ```bash
    yarn install
    ```
    This command will download and install all the necessary packages defined in `package.json`.

### Environment Variables

Career Craft may require environment variables for integrating with backend services like Supabase or other APIs.

1.  **Create a local environment file:**
    In the root of the project, create a copy of `.env.example` (if it exists) or create a new file named `.env`.
    ```bash
    cp .env.example .env  # If .env.example exists
    # OR
    touch .env            # If creating a new file
    ```

2.  **Populate the `.env` file:**
    Open the `.env` file and add the required variables. For instance, if using Supabase for backend services:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    # Add other API keys or configuration variables as needed
    ```
    Replace placeholder values with your actual credentials. These variables are prefixed with `VITE_` to be exposed to the frontend client-side code by Vite.

### Running the Application

1.  **Start the development server:**
    Once dependencies are installed and environment variables are set up, run the following command from the project root to start the Vite development server:
    ```bash
    npm run dev
    ```
    Or with yarn:
    ```bash
    yarn dev
    ```

2.  **Access the application:**
    The development server will typically start on `http://localhost:5173` (Vite's default). Open this URL in your web browser to see the application running. The console output will confirm the exact address and port.
    The server supports Hot Module Replacement (HMR), so changes you make to the code will reflect in the browser almost instantly without a full page reload.

3.  **Build for production:**
    To create an optimized production build, run:
    ```bash
    npm run build
    ```
    Or with yarn:
    ```bash
    yarn build
    ```
    The production-ready files will be placed in the `dist/` directory.

## Usage

Once Career Craft is running, users can interact with its core features:

*   **Navigating the Dashboard**: Upon login (if authentication is implemented), users land on their personalized dashboard. This area provides a quick summary of their job search progress, recent resume analyses, and upcoming tasks or interviews.
*   **Tracking Job Applications**: 
    *   Users can navigate to a 'Job Tracker' or 'Applications' section.
    *   To add a new job, they'll typically fill out a form with details like company name, job title, application link, date applied, current status, and any personal notes.
    *   Existing applications can be viewed in a list or board format, allowing users to update their status (e.g., from 'Applied' to 'Interview Scheduled') or edit other details.
*   **Analyzing Resumes**: 
    *   In the 'Resume Analyser' section, users can upload their resume file.
    *   After processing, the system will display a report with feedback on various aspects of the resume, such as keyword optimization, clarity, formatting, and potential areas for improvement.
    *   Users can use this feedback to revise their resumes and re-analyze them.
*   **Managing Profile/Settings**: Users might have a profile section to manage their account details, preferences (like dark mode), or stored resume versions.

## Deployment

To deploy Career Craft to a live environment, you'll first need to build the application.

1.  **Build the Project**:
    ```bash
    npm run build
    ```
    This command bundles your application into static files (HTML, CSS, JavaScript) in the `dist/` directory.

2.  **Choose a Hosting Platform**: You can deploy the contents of the `dist/` directory to various static hosting providers, such as:
    *   [Vercel](https://vercel.com/)
    *   [Netlify](https://www.netlify.com/)
    *   [GitHub Pages](https://pages.github.com/)
    *   [AWS S3](https://aws.amazon.com/s3/) with CloudFront
    *   Firebase Hosting

3.  **Platform-Specific Deployment**:
    *   **Vercel/Netlify**: Connect your Git repository (e.g., GitHub, GitLab, Bitbucket) to Vercel or Netlify. They will automatically detect it's a Vite project, build it, and deploy it. Set your environment variables (like `VITE_SUPABASE_URL`) in the platform's dashboard.
    *   **GitHub Pages**: Configure GitHub Actions to build and deploy your `dist` folder to the `gh-pages` branch. You might need to adjust `base` in `vite.config.ts` if deploying to a subdirectory.
    *   **Manual Deployment**: For other platforms, you can typically upload the contents of the `dist/` folder via their CLI or web interface.

4.  **Environment Variables in Production**: Ensure that all necessary environment variables (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are correctly configured in your hosting platform's settings. These are crucial for the application to connect to backend services.

## Troubleshooting

Here are some common issues and how to resolve them:

*   **Application Fails to Start**: 
    *   Ensure all dependencies are installed correctly (`npm install` or `yarn install`).
    *   Check if Node.js and npm/yarn are on compatible versions.
    *   Look for errors in the terminal output when running `npm run dev`.
*   **Environment Variables Not Loaded**: 
    *   Verify your `.env` file is in the project root and correctly named.
    *   Ensure variables are prefixed with `VITE_` (e.g., `VITE_API_URL`).
    *   Restart the development server after changing `.env` files.
*   **Tailwind CSS Styles Not Applying**: 
    *   Confirm `tailwind.config.js` and `postcss.config.js` are correctly set up.
    *   Ensure your global CSS file (`src/index.css` or similar) includes `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`.
    *   Check if the `content` paths in `tailwind.config.js` correctly point to your template files (e.g., `jsx`, `tsx`, `html`).
*   **API Calls Failing (e.g., to Supabase)**:
    *   Double-check API keys and URLs in your `.env` file and on your hosting platform.
    *   Inspect browser network tab for error messages from the API.
    *   Verify Supabase RLS (Row Level Security) policies if data access is an issue.
*   **Build Fails**: 
    *   Look for TypeScript errors or other build-time errors in the console output.
    *   Ensure all imported modules are correctly installed and paths are accurate.

## Future Enhancements

Potential features and improvements for future versions of Career Craft:

*   **Advanced Resume Versioning**: Allow users to save and manage multiple versions of their resume.
*   **Cover Letter Generator**: AI-assisted tool to help draft cover letters tailored to specific jobs.
*   **Interview Preparation Tools**: Resources like common interview questions, mock interview simulators, or note-taking features for interviews.
*   **Networking Features**: Ability to connect with other users or mentors on the platform.
*   **Company Insights**: Deeper information about companies, including reviews, culture, and interview experiences.
*   **Direct Job Applications**: Integration to apply for jobs directly through Career Craft.
*   **Enhanced Analytics**: More detailed visualizations and reports on job search progress and resume effectiveness.
*   **Mobile Application**: Native mobile apps (iOS/Android) for on-the-go job tracking.
*   **Browser Extension**: A companion browser extension to easily save jobs from various job boards.

## Contact

This project was created and is maintained by **Parth Sharma**.

*   **Email**: [Ksparth12@gmail.com](mailto:Ksparth12@gmail.com)
*   **LinkedIn**: [linkedin.com/in/ksparth128](https://www.linkedin.com/in/ksparth128)
*   **GitHub**: [github.com/ksparth12](https://github.com/ksparth12)

Feel free to reach out with any questions, feedback, suggestions, or collaboration inquiries!

## Contributing

Contributions are highly encouraged and welcome! If you're interested in contributing to Career Craft, please follow these guidelines:

1.  **Fork the Repository**: Create your own copy of the project.
2.  **Create a Feature Branch**: `git checkout -b feature/YourAmazingFeature`
3.  **Commit Your Changes**: `git commit -m 'Add some AmazingFeature'`
4.  **Push to the Branch**: `git push origin feature/YourAmazingFeature`
5.  **Open a Pull Request**: Submit a PR against the `main` or `develop` branch of the original repository.

Before submitting a PR, please ensure your code:
*   Adheres to the project's coding style (enforced by ESLint/Prettier).
*   Includes relevant tests for new features or bug fixes.
*   Is well-documented, especially for complex logic.

## License

This project is licensed under the MIT License. See the `LICENSE` file (if one is created) for full details. In summary, you are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, provided the original copyright notice and this permission notice are included in all copies or substantial portions of the Software.

---

Thank you for checking out Career Craft! We hope it helps you in your career journey.