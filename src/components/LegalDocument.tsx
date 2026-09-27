"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

interface LegalDocumentProps {
  title: string;
  intro: string;
  sections: LegalSection[];
  children?: ReactNode;
}

export function LegalDocument({ title, intro, sections, children }: LegalDocumentProps) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("revealed", entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: "-20px 0px" }
    );

    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <SiteHeader />
      <main className="flex-1 page-enter">
        <header className="portugal-atmosphere border-b border-black/[0.07] bg-[#f4efe6] py-14 sm:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-gray-500" data-reveal>CVViews · Informação legal</p>
            <h1 className="font-hero-title text-4xl sm:text-5xl font-black leading-tight text-gray-950" data-reveal="delay-1">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-600" data-reveal="delay-2">{intro}</p>
            <p className="mt-6 text-xs text-gray-500" data-reveal="delay-3">Atualizado em 26 de setembro de 2026</p>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <article className="max-w-3xl space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="scroll-mt-24" data-reveal>
                <h2 className="text-xl font-bold text-gray-950">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.bullets && (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.bullets.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </section>
            ))}
            {children}
          </article>

          <aside className="lg:pl-8">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Documentos</p>
            <nav aria-label="Documentos legais" className="flex flex-col items-start gap-3 text-sm" data-reveal="delay-1">
              <Link href="/privacidade" className="text-gray-600 hover:text-gray-950 transition-colors">Privacidade</Link>
              <Link href="/termos" className="text-gray-600 hover:text-gray-950 transition-colors">Termos de serviço</Link>
              <Link href="/cookies" className="text-gray-600 hover:text-gray-950 transition-colors">Cookies</Link>
            </nav>
          </aside>
        </div>
      </main>
    </div>
  );
}