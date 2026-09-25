"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/Logo";

export default function AboutPage() {
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
      { threshold: 0.1, rootMargin: "-20px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-gray-900 flex flex-col font-sans selection:bg-gray-200 selection:text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 border-b border-black/[0.08] shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-[66px] flex items-center justify-between">
          <Link href="/" aria-label="CVViews Home">
            <BrandLogo size={27} />
          </Link>

          <div className="flex items-center gap-8">
            <Link href="/#upload-cv" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Upload</Link>
            <Link href="/about" className="text-sm font-medium text-gray-950 font-bold hover:text-gray-950 transition-colors hidden sm:block">About</Link>
            <Link href="/chat" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Chat</Link>
            <Link href="/#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors hidden sm:block">Pricing</Link>
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

      {/* Main Content */}
      <main className="flex-1 page-enter">

        {/* Hero */}
        <section className="border-b border-black/[0.07] bg-white py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4" data-reveal>
              About CVViews
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 mb-6 leading-tight tracking-tight max-w-3xl" data-reveal>
              Designed to help professionals pass ATS filters and ace high-stakes interviews.
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-2xl" data-reveal>
              Over 75% of qualified applicants are filtered out before a recruiter reads their resume.
              CVViews levels the playing field with AI-powered diagnostics and interview coaching.
            </p>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-xl" data-reveal>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">98%</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">ATS Parsing Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">50k+</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">Resumes Audited</div>
              </div>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">3.2x</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">Average Callback Increase</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2-column body */}
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left column — sticky nav */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">On this page</p>
                {[
                  { label: "Our Mission",   href: "#mission" },
                  { label: "Why We Started", href: "#origin" },
                  { label: "How It Works",   href: "#how" },
                  { label: "Team",           href: "#team" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-950 py-1.5 transition-colors group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-gray-900 transition-colors" />
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>

            {/* Right column — content */}
            <div className="lg:col-span-2 space-y-16">

              {/* Mission */}
              <div id="mission" data-reveal>
                <h2 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">Our Mission</h2>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  We believe that talented individuals shouldn't be blocked by opaque recruitment algorithms.
                  Our mission is to democratize access to top-tier career opportunities by giving every
                  candidate the tools to decode the ATS black box.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  CVViews provides systematic resume audits, precise structural diagnostics, and an interactive
                  practice assistant designed to turn candidate qualifications into compelling career stories.
                </p>
              </div>

              {/* Origin */}
              <div id="origin" className="border-t border-black/[0.07] pt-12" data-reveal>
                <h2 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">Why We Started</h2>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  After seeing countless qualified peers rejected due to formatting issues rather than lack of
                  skills, our team of ex-recruiters and AI engineers built CVViews.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  We trained our engine on millions of successful and rejected resumes to give you an unfair
                  advantage in today's competitive job market — not by gaming the system, but by helping you
                  present your real value with clarity and precision.
                </p>
              </div>

              {/* How It Works */}
              <div id="how" className="border-t border-black/[0.07] pt-12">
                <h2 className="text-2xl font-black text-gray-950 mb-8 tracking-tight" data-reveal>How It Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { n: "1", title: "Upload Resume",      desc: "Drag and drop your resume in PDF or DOCX. We process it in seconds." },
                    { n: "2", title: "Instant ATS Scan",   desc: "Our engine identifies missing keywords, formatting errors, and unreadable sections." },
                    { n: "3", title: "Fix & Optimize",     desc: "Follow step-by-step suggestions to rephrase bullet points and quantify your impact." },
                    { n: "4", title: "Interview Practice", desc: "Use AI Chat to simulate real interviews based on your optimized profile." },
                  ].map((card, i) => (
                    <div
                      key={card.n}
                      data-reveal={`delay-${i}`}
                      className="group flex gap-4 p-5 rounded-2xl border border-black/[0.08] hover:border-black/[0.15] bg-white hover:bg-gray-50 transition-all shadow-xs hover:shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-gray-900 flex items-center justify-center text-sm font-black text-gray-900 group-hover:text-white transition-colors shrink-0">
                        {card.n}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-950 mb-1">{card.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-black/[0.07] pt-12" data-reveal>
                <div className="rounded-2xl bg-gray-950 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-black text-white mb-1">Ready to get started?</h3>
                    <p className="text-sm text-gray-400">Upload your resume and get your ATS score in seconds.</p>
                  </div>
                  <Link href="/signup" target="_blank" rel="noopener noreferrer"
                    className="shrink-0 text-sm font-bold px-6 py-3 rounded-full bg-white text-gray-950 hover:bg-gray-100 transition-colors shadow-sm">
                    Get started free →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

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
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="LinkedIn">in</a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="Twitter">X</a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="GitHub">GH</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/#upload-cv" className="hover:text-gray-950 transition-colors">Upload Resume</Link></li>
              <li><Link href="/chat" className="hover:text-gray-950 transition-colors">Chat</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-950 transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-950 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Legal</h4>
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
