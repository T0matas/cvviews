"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import { HeroSection } from "@/components/HeroSection";
import { CVUploadSection } from "@/components/CVUploadSection";
import { Logo, BrandLogo } from "@/components/ui/Logo";

export default function Home() {
  const [activeCVFile, setActiveCVFile] = useState("Software_Engineer_Resume.pdf");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Optimize scroll reveal to only trigger once to prevent scroll lag
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          } else {
            entry.target.classList.remove("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "-20px 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);



  return (
    <div className="min-h-screen bg-transparent text-gray-900 flex flex-col font-sans selection:bg-gray-200 selection:text-gray-900 page-enter">
      {/* Navigation */}
      <nav className={`glass-topbar sticky top-0 z-50${isScrolled ? " is-scrolled" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-[66px] flex items-center justify-between">
          <Link href="/" aria-label="CVViews Home">
            <BrandLogo size={27} />
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/#upload-cv" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Upload</Link>
            <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">About</Link>
            <Link href="/chat" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Chat</Link>
            <a href="#pricing"  className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Pricing</a>
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== "undefined") {
                    window.open("/login", "_blank", "noopener,noreferrer");
                  }
                }}
                className="text-xs font-semibold px-4 py-2 text-gray-700 hover:text-gray-950 transition-colors cursor-pointer border border-black/[0.12] rounded-full hover:bg-gray-100/80 inline-flex items-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== "undefined") {
                    window.open("/signup", "_blank", "noopener,noreferrer");
                  }
                }}
                className="text-xs font-bold px-4 py-2 rounded-full bg-gray-950 hover:bg-gray-800 text-white transition-all cursor-pointer shadow-xs hover:shadow-md inline-flex items-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Interactive CV Upload & AI Diagnostic Section */}
      <CVUploadSection
        onAnalyzeComplete={(data) => {
          setActiveCVFile(data.fileName);
        }}
      />







      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 w-full mb-20 scroll-mt-28 optimized-section">
        <div className="text-center mb-14" data-reveal>
          <h2 className="text-3xl font-bold text-gray-950 mb-3 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Choose the plan that best fits your career goals. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-3xl border border-black/[0.08] bg-white p-8 hover:border-black/[0.2] transition-colors shadow-sm flex flex-col" data-reveal="delay-0">
            <h3 className="text-xl font-bold text-gray-950 mb-2">Basic</h3>
            <p className="text-sm text-gray-500 mb-6">Essential tools to get your resume noticed.</p>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-950">Free</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>1 Resume Upload per month</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Basic ATS score check</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>5 AI Chat messages per session</span>
              </li>
            </ul>
            <Link href="/signup" target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 rounded-full border border-black/[0.12] text-center text-sm font-black text-gray-900 hover:bg-gray-100 transition-colors">
              Get Started for Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border-2 border-gray-900 bg-gray-900 p-8 shadow-xl flex flex-col relative" data-reveal="delay-1">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-sm text-gray-400 mb-6">Unlimited access to land your dream job.</p>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">$19</span>
              <span className="text-sm text-gray-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Unlimited Resume Uploads</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Deep ATS diagnostics & rewrite suggestions</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Unlimited AI Interview Practice</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Priority support</span>
              </li>
            </ul>
            <Link
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.open("/signup", "_blank", "noopener,noreferrer");
                }
              }}
              className="w-full py-3 px-4 rounded-full bg-white text-center text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 w-full mb-20 scroll-mt-28 optimized-section">
        <div className="text-center mb-14" data-reveal>
          <h2 className="text-3xl font-bold text-gray-950 mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Everything you need to know about the product and billing.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does the ATS compatibility check work?",
              a: "Our engine uses parsing algorithms similar to those used by major applicant tracking systems (ATS) like Workday, Taleo, and Greenhouse. It identifies missing keywords, formatting errors, and unreadable sections to ensure human recruiters actually see your resume."
            },
            {
              q: "Can I use CVViews for multiple roles?",
              a: "Yes! You can upload different versions of your resume and chat with the AI assistant to tailor each one to specific job descriptions. The assistant dynamically adjusts its feedback based on the industry and role you are targeting."
            },
            {
              q: "Is my resume data kept private?",
              a: "Absolutely. We do not sell your personal data. Your resumes and chat transcripts are encrypted and solely used to generate actionable insights for your job hunt."
            },
            {
              q: "How does the interview practice feature work?",
              a: "The AI acts as your interviewer, asking technical and behavioral questions derived from the specific skills listed on your uploaded resume. You can answer via text or voice, and receive immediate feedback on your response structure."
            }
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white border border-black/[0.08] hover:border-black/[0.2] transition-colors overflow-hidden"
              data-reveal={`delay-${i % 4}`}
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-base font-bold text-gray-950 outline-none select-none">
                {faq.q}
                <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors ml-4 shrink-0">
                  <span className="absolute w-3 h-0.5 bg-gray-600 group-open:bg-gray-900 transition-colors"></span>
                  <span className="absolute h-3 w-0.5 bg-gray-600 group-open:bg-gray-900 group-open:rotate-90 transition-transform duration-300"></span>
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-black/[0.04] pt-4 mt-2">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/[0.08] bg-[#f4efe6] text-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4" aria-label="CVViews Home">
              <BrandLogo size={27} />
            </Link>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
              Precision resume diagnostics, ATS optimization, and role-tailored interview practice.
            </p>
            <div className="flex gap-2.5">
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="Twitter"
              >
                X
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="GitHub"
              >
                GH
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/#upload-cv" className="hover:text-gray-950 transition-colors">Upload Resume</Link></li>
              <li><Link href="/chat" className="hover:text-gray-950 transition-colors">Chat</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-950 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><a href="#" className="hover:text-gray-950 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 CVViews. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
