"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Check,
  Copy,
  BarChart3,
  ListFilter,
  FileEdit,
  HelpCircle,
} from "lucide-react";

export interface DiagnosticData {
  fileName: string;
  fileSize: string;
  roleTarget: string;
  score: number;
  atsScore: number;
  impactScore: number;
  clarityScore: number;
  keywordsScore: number;
  goodPoints: { title: string; desc: string; tag: string }[];
  badPoints: { title: string; desc: string; tag: string }[];
  rewriteExample: {
    section: string;
    before: string;
    after: string;
    explanation: string;
  };
  interviewQuestions: {
    question: string;
    context: string;
    framework: string;
  }[];
}

const SAMPLE_PRESETS: Record<string, DiagnosticData> = {
  tech: {
    fileName: "Resume_Software_Engineer.pdf",
    fileSize: "245 KB",
    roleTarget: "Senior Full Stack Engineer",
    score: 84,
    atsScore: 92,
    impactScore: 68,
    clarityScore: 90,
    keywordsScore: 82,
    goodPoints: [
      {
        title: "ATS-Compliant Layout",
        desc: "Single-column format without nested tables or unusual vector elements that break automated parsers.",
        tag: "Structure",
      },
      {
        title: "Domain Categorization",
        desc: "Technologies clearly separated into Front-end, Back-end, and Cloud Infrastructure.",
        tag: "Skills",
      },
      {
        title: "Career Progression",
        desc: "Clean chronological milestones showing increased ownership across engineering roles.",
        tag: "Experience",
      },
    ],
    badPoints: [
      {
        title: "Lacks Numerical Impact",
        desc: "Recent achievements describe routine duties instead of quantifiable metrics (e.g. latency, scale, cost).",
        tag: "Impact",
      },
      {
        title: "Generic Opening Summary",
        desc: "Position summary uses vague phrases instead of stating core technical domain and business value.",
        tag: "Summary",
      },
      {
        title: "Missing Key Keywords",
        desc: "Senior engineering job postings currently filter heavily for 'CI/CD Pipelines', 'Automated Testing', and 'System Design'.",
        tag: "Keywords",
      },
    ],
    rewriteExample: {
      section: "Experience · Senior Engineer",
      before: "Responsible for developing new features and fixing bugs on the primary web platform.",
      after: "Architected 5 core microservices in React and Node.js, reducing API latency by 40% for 120,000+ daily active users.",
      explanation: "Replaces passive task descriptions with strong action verbs and concrete, measurable business outcomes.",
    },
    interviewQuestions: [
      {
        question: "How do you evaluate performance trade-offs against tight sprint release schedules?",
        context: "Assesses architectural judgment and delivery discipline under deadline pressure.",
        framework: "STAR Method",
      },
      {
        question: "Describe a critical production bottleneck you diagnosed and how you guided the team to resolve it.",
        context: "Focuses on root-cause analysis, cross-functional communication, and engineering leadership.",
        framework: "Technical Deep-Dive",
      },
    ],
  },
  marketing: {
    fileName: "Resume_Marketing_Lead.pdf",
    fileSize: "310 KB",
    roleTarget: "Head of Growth & Marketing",
    score: 79,
    atsScore: 86,
    impactScore: 72,
    clarityScore: 85,
    keywordsScore: 74,
    goodPoints: [
      {
        title: "Clear Visual Hierarchy",
        desc: "Clean typography and scannable bullet points allow recruiters to review qualifications in seconds.",
        tag: "Design",
      },
      {
        title: "Modern Tool Stack",
        desc: "Direct references to industry-standard platforms (HubSpot, GA4, Meta Ads, Segment).",
        tag: "Competencies",
      },
      {
        title: "Relevant Certifications",
        desc: "Accreditations prominently placed to validate ongoing professional domain mastery.",
        tag: "Education",
      },
    ],
    badPoints: [
      {
        title: "Missing ROAS & CAC Figures",
        desc: "Paid acquisition campaigns lack specific return on ad spend and cost per acquisition percentages.",
        tag: "Metrics",
      },
      {
        title: "Attribution Modeling Omitted",
        desc: "Does not clarify multi-touch attribution or CRM pipeline integration methodologies.",
        tag: "Strategy",
      },
      {
        title: "Language Benchmark Ambiguity",
        desc: "Foreign language proficiency is listed without standardized rating frameworks.",
        tag: "Details",
      },
    ],
    rewriteExample: {
      section: "Experience · Growth Marketing Manager",
      before: "Managed social media channels and created paid ad campaigns to generate leads.",
      after: "Directed an $80k/month acquisition budget across Meta and Google, lifting qualified pipeline by 32% while lowering CAC by 18%.",
      explanation: "Demonstrates fiscal responsibility, channel authority, and measurable revenue contributions.",
    },
    interviewQuestions: [
      {
        question: "What was your highest-ROI campaign, and which exact metrics determined its overall business success?",
        context: "Evaluates analytical rigor and multi-channel revenue attribution ability.",
        framework: "Data Defense",
      },
      {
        question: "How do you systematically structure A/B testing on landing pages when conversion plateaus?",
        context: "Tests disciplined experimentation and conversion rate optimization strategy.",
        framework: "Methodology",
      },
    ],
  },
  business: {
    fileName: "Resume_Product_Manager.pdf",
    fileSize: "198 KB",
    roleTarget: "Senior Product Manager",
    score: 88,
    atsScore: 95,
    impactScore: 82,
    clarityScore: 94,
    keywordsScore: 85,
    goodPoints: [
      {
        title: "Outcome-Driven Phrasing",
        desc: "Explicit links between feature releases and customer business KPIs (NPS, retention, customer LTV).",
        tag: "Impact",
      },
      {
        title: "Agile & Discovery Alignment",
        desc: "Clear demonstration of continuous discovery, sprint governance, and backlog prioritization.",
        tag: "Process",
      },
      {
        title: "Concise Executive Summary",
        desc: "Punchy, value-focused introductory paragraph establishing strategic product strengths.",
        tag: "Summary",
      },
    ],
    badPoints: [
      {
        title: "Qualitative Discovery Detail",
        desc: "Could elaborate further on customer interview sample sizes and synthesis frameworks.",
        tag: "Discovery",
      },
      {
        title: "Cross-Functional Triad Scope",
        desc: "Needs deeper specifics on day-to-day collaboration with design and engineering leads.",
        tag: "Collaboration",
      },
    ],
    rewriteExample: {
      section: "Experience · Product Lead",
      before: "Defined product roadmap and prioritized backlog with executive stakeholders.",
      after: "Synthesized qualitative insights from 45 user interviews into a quarterly roadmap, driving a 48% increase in new feature adoption.",
      explanation: "Directly bridges customer discovery effort with tangible user adoption metrics.",
    },
    interviewQuestions: [
      {
        question: "How do you navigate conflicting high-priority stakeholder requests against core quarterly OKRs?",
        context: "Examines stakeholder diplomacy, backlog prioritization frameworks, and trade-off defense.",
        framework: "Executive Alignment",
      },
      {
        question: "Walk through a product launch that missed its initial target and the iterative pivots you executed.",
        context: "Evaluates resilience, data-driven post-mortems, and customer feedback responsiveness.",
        framework: "Post-Mortem Analysis",
      },
    ],
  },
};

interface CVUploadSectionProps {
  onAnalyzeComplete?: (data: DiagnosticData) => void;
}

export function CVUploadSection({ onAnalyzeComplete }: CVUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "rewrites" | "interview">("overview");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Parsing text hierarchy and section structure...",
    "Benchmarking ATS compatibility...",
    "Auditing action verbs and metric density...",
    "Generating actionable recommendations...",
  ];

  const handleStartAnalysis = (presetKey: string = "tech", customFile?: File) => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setDiagnosticResult(null);

    const baseData = SAMPLE_PRESETS[presetKey] || SAMPLE_PRESETS.tech;
    const finalData: DiagnosticData = customFile
      ? {
          ...baseData,
          fileName: customFile.name,
          fileSize: `${(customFile.size / 1024).toFixed(1)} KB`,
        }
      : baseData;

    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setDiagnosticResult(finalData);
            setActiveTab("overview");
            if (onAnalyzeComplete) {
              onAnalyzeComplete(finalData);
            }
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      handleStartAnalysis("tech", selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      handleStartAnalysis("tech", droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetAnalysis = () => {
    setFile(null);
    setDiagnosticResult(null);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyRewrite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToChat = () => {
    document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="upload-cv" className="max-w-6xl mx-auto px-6 w-full mb-16 scroll-mt-20">
      {/* Container */}
      <div className="rounded-3xl border border-black/[0.08] bg-white overflow-hidden shadow-xl">
        {!diagnosticResult && !isAnalyzing && (
          <div className="p-8 sm:p-12">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-3 tracking-tight">
                Upload your resume for an instant diagnostic report
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Receive an objective structural audit, ATS compatibility check, and actionable bullet point rewrites.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-gray-950 bg-gray-100"
                  : "border-black/[0.12] hover:border-gray-950 bg-gray-50/60 hover:bg-gray-50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-gray-100 border border-black/[0.08] flex items-center justify-center text-gray-900 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-950">
                  Drop your resume here, or <span className="underline underline-offset-4 text-black">browse files</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF, Word, or TXT up to 10MB
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 text-[11px] text-gray-400 font-medium">
                <span>ATS Tested</span>
                <span>·</span>
                <span>Encrypted &amp; Private</span>
                <span>·</span>
                <span>Instant Feedback</span>
              </div>
            </div>

            {/* Sample Presets */}
            <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-500 font-medium">
                Or inspect a sample candidate audit:
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStartAnalysis("tech")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Software Engineer
                </button>
                <button
                  onClick={() => handleStartAnalysis("marketing")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Marketing Lead
                </button>
                <button
                  onClick={() => handleStartAnalysis("business")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Product Manager
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Minimalist Loading State */}
        {isAnalyzing && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-black/15 border-t-black animate-spin mb-6"></div>

            <h3 className="text-xl font-bold text-gray-950 mb-2">
              Auditing Resume
            </h3>
            <p className="text-xs text-gray-500 mb-8 max-w-sm">
              Analyzing document hierarchy, ATS compatibility, and impact metrics.
            </p>

            <div className="w-full max-w-sm space-y-2 text-left">
              {steps.map((st, idx) => {
                const isCurrent = idx === analysisStep;
                const isDone = idx < analysisStep;

                return (
                  <div
                    key={st}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isDone
                        ? "bg-gray-50 border-black/[0.08] text-gray-700"
                        : isCurrent
                        ? "bg-gray-950 border-black text-white font-semibold shadow-xs"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    <span>{st}</span>
                    {isDone && <Check className="w-3.5 h-3.5 text-gray-900" />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Refined Executive Report Interface */}
        {diagnosticResult && !isAnalyzing && (
          <div>
            {/* Top Bar / Document Metadata */}
            <div className="px-6 py-4 border-b border-black/[0.08] bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-black/[0.1] flex items-center justify-center text-gray-900 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-950">
                      {diagnosticResult.fileName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-black/[0.1] text-gray-600 font-medium">
                      {diagnosticResult.fileSize}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Targeting: {diagnosticResult.roleTarget}
                  </p>
                </div>
              </div>

              <button
                onClick={resetAnalysis}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-black/[0.12] text-gray-700 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                Replace Document
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-black/[0.08] flex items-center gap-2 overflow-x-auto bg-white">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Overview &amp; Scores
              </button>

              <button
                onClick={() => setActiveTab("findings")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "findings"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                Key Findings
              </button>

              <button
                onClick={() => setActiveTab("rewrites")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "rewrites"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                Actionable Rewrites
              </button>

              <button
                onClick={() => setActiveTab("interview")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "interview"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Interview Prep
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8 bg-white">
              {/* TAB 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Score Highlight Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-gray-50/70 border border-black/[0.08]">
                    {/* Left: Main Score */}
                    <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-black/[0.08] pb-6 md:pb-0 md:pr-6">
                      <div className="w-20 h-20 rounded-2xl bg-gray-950 flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-3xl font-black text-white">
                          {diagnosticResult.score}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                          / 100
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-950 block">
                          Strong Foundation
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          Your resume is in the top 20% of applicants, but missing impact metrics reduce conversion.
                        </p>
                      </div>
                    </div>

                    {/* Right: Breakdown Bars */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">ATS Parsing</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.atsScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-950 rounded-full" style={{ width: `${diagnosticResult.atsScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Zero structural errors</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Metric Density</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.impactScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600 rounded-full" style={{ width: `${diagnosticResult.impactScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Needs outcome numbers</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Keywords</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.keywordsScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-800 rounded-full" style={{ width: `${diagnosticResult.keywordsScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Well-aligned with target</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-black/[0.08] space-y-3">
                      <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider">
                        Executive Audit Summary
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        The document demonstrates strong technical competencies and a consistent career trajectory. The primary area for optimization is replacing passive task phrasing in recent roles with quantifiable business metrics.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-gray-50/50 border border-black/[0.08] space-y-3 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider mb-2">
                          Recommended Next Steps
                        </h4>
                        <ul className="text-xs text-gray-600 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            Review and apply the bullet point rewrites.
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            Incorporate missing industry keywords.
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                            Practice tailored interview questions in the assistant below.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Findings */}
              {activeTab === "findings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-gray-900" />
                      Strengths Identified ({diagnosticResult.goodPoints.length})
                    </h4>
                    <div className="space-y-2.5">
                      {diagnosticResult.goodPoints.map((pt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-950">{pt.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-medium">
                              {pt.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas to improve */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      Areas for Revision ({diagnosticResult.badPoints.length})
                    </h4>
                    <div className="space-y-2.5">
                      {diagnosticResult.badPoints.map((pt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-950">{pt.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 font-medium">
                              {pt.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Rewrites */}
              {activeTab === "rewrites" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">
                        Bullet Point Optimization
                      </h4>
                      <p className="text-xs text-gray-500">
                        Targeted transformation from passive responsibility to quantified achievement.
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{diagnosticResult.rewriteExample.section}</span>
                  </div>

                  {/* Side by side diff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="p-5 rounded-2xl bg-gray-50 border border-black/[0.08] space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Original Phrasing
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        &ldquo;{diagnosticResult.rewriteExample.before}&rdquo;
                      </p>
                    </div>

                    {/* After */}
                    <div className="p-5 rounded-2xl bg-black text-white space-y-2 relative group shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                          Revised High-Impact Version
                        </span>
                        <button
                          onClick={() => copyRewrite(diagnosticResult.rewriteExample.after)}
                          className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed">
                        &ldquo;{diagnosticResult.rewriteExample.after}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] text-xs text-gray-600">
                    <span className="text-gray-950 font-bold">Why this revision works:</span> {diagnosticResult.rewriteExample.explanation}
                  </div>
                </div>
              )}

              {/* TAB 4: Interview Scenarios */}
              {activeTab === "interview" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="mb-2">
                    <h4 className="text-sm font-bold text-gray-950">
                      Profile-Specific Interview Questions
                    </h4>
                    <p className="text-xs text-gray-500">
                      Generated based on the specific experience gaps and technical claims in your resume.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {diagnosticResult.interviewQuestions.map((q, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-black/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-950">
                            Question {idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-black/[0.1] text-gray-700 font-medium">
                            {q.framework}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          &ldquo;{q.question}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500 pt-1">
                          {q.context}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={scrollToChat}
                      className="text-xs px-4 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Practice Live in Assistant Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
