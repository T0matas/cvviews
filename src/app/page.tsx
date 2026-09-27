"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

import { HeroSection } from "@/components/HeroSection";
import { CVUploadSection } from "@/components/CVUploadSection";
import { BrandLogo } from "@/components/ui/Logo";
import { SiteHeader } from "@/components/SiteHeader";
import { ANALYSIS_STORAGE_KEY } from "@/lib/userSession";

export default function Home() {
  const [activeCVFile, setActiveCVFile] = useState("Software_Engineer_Resume.pdf");
  // Optimize scroll reveal to only trigger once to prevent scroll lag
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
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
    <div className="min-h-screen bg-transparent text-gray-900 flex flex-col font-sans selection:bg-gray-200 selection:text-gray-900">
      {/* Navigation */}
      <SiteHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Interactive CV Upload & AI Diagnostic Section */}
      <CVUploadSection
        onAnalyzeComplete={(data) => {
          setActiveCVFile(data.fileName);
          const stored = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
          const analyses = stored ? JSON.parse(stored) : [];
          window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify([
            { id: `${Date.now()}-${data.fileName}`, createdAt: new Date().toISOString(), data },
            ...analyses,
          ].slice(0, 20)));
        }}
      />







      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 w-full mb-12 sm:mb-20 scroll-mt-28 optimized-section">
        <div className="text-center mb-8 sm:mb-14" data-reveal>
          <h2 className="text-3xl font-bold text-gray-950 mb-3 tracking-tight">
            Preços simples e transparentes
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Escolha o plano mais adequado aos seus objetivos profissionais. Sem custos escondidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-2xl sm:rounded-3xl border border-black bg-white p-5 sm:p-8 hover:border-black transition-colors shadow-sm flex flex-col" data-reveal="delay-0">
            <h3 className="text-xl font-bold text-gray-950 mb-2">Básico</h3>
            <p className="text-sm text-gray-500 mb-6">As ferramentas essenciais para destacar o seu CV.</p>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-950">Grátis</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>1 carregamento de CV por mês</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Verificação básica da pontuação ATS</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-gray-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>5 mensagens de chat com IA por sessão</span>
              </li>
            </ul>
            <Link href="/signup" className="w-full py-3 px-4 rounded-full border border-black/[0.12] text-center text-sm font-black text-gray-900 hover:bg-gray-100 transition-colors">
              Começar gratuitamente
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-gray-900 bg-gray-900 p-5 sm:p-8 shadow-xl flex flex-col relative" data-reveal="delay-1">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Mais popular
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <p className="text-sm text-gray-400 mb-6">Acesso ilimitado para alcançar o emprego dos seus sonhos.</p>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white">19 €</span>
              <span className="text-sm text-gray-400">/mês</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Carregamentos ilimitados de CV</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Diagnóstico ATS aprofundado e sugestões de reformulação</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Prática ilimitada de entrevistas com IA</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white">Suporte prioritário</span>
              </li>
            </ul>
            <Link
              href="/signup"
              className="w-full py-3 px-4 rounded-full bg-white text-center text-sm font-bold text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Mudar para Pro
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-12 sm:mb-20 scroll-mt-28 optimized-section">
        <div className="text-center mb-8 sm:mb-14" data-reveal>
          <h2 className="text-3xl font-bold text-gray-950 mb-3 tracking-tight">
            Perguntas frequentes
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Tudo o que precisa de saber sobre o produto e a faturação.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Como funciona a verificação de compatibilidade com ATS?",
              a: "O nosso motor utiliza algoritmos de análise semelhantes aos dos principais sistemas de acompanhamento de candidatos (ATS), como Workday, Taleo e Greenhouse. Identifica palavras-chave em falta, erros de formatação e secções ilegíveis para garantir que os recrutadores conseguem ver o seu CV."
            },
            {
              q: "Posso utilizar o CVViews para várias funções?",
              a: "Sim! Pode carregar diferentes versões do seu CV e conversar com o assistente de IA para adaptar cada uma a descrições de funções específicas. O assistente ajusta o feedback com base no setor e na função que pretende."
            },
            {
              q: "Os dados do meu CV são mantidos privados?",
              a: "Sem dúvida. Não vendemos os seus dados pessoais. Os seus CV e conversas são encriptados e utilizados exclusivamente para gerar recomendações úteis para a sua procura de emprego."
            },
            {
              q: "Como funciona a prática de entrevistas?",
              a: "A IA assume o papel de entrevistador e coloca perguntas técnicas e comportamentais baseadas nas competências do seu CV. Pode responder por texto ou voz e receber feedback imediato sobre a estrutura da sua resposta."
            }
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white border border-black hover:border-black transition-colors overflow-hidden"
              data-reveal={`delay-${i % 4}`}
            >
              <summary className="flex items-center justify-between p-4 sm:p-6 cursor-pointer list-none text-base font-bold text-gray-950 outline-none select-none">
                {faq.q}
                <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors ml-4 shrink-0">
                  <span className="absolute w-3 h-0.5 bg-gray-600 group-open:bg-gray-900 transition-colors"></span>
                  <span className="absolute h-3 w-0.5 bg-gray-600 group-open:bg-gray-900 group-open:rotate-90 transition-transform duration-300"></span>
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-gray-600 leading-relaxed border-t border-black/[0.04] pt-4 mt-2">
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
              Diagnóstico preciso de CV, otimização para ATS e prática de entrevistas adaptadas à função.
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://www.linkedin.com/company/cvviews"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://x.com/cvviews"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="Twitter"
              >
                X
              </a>
              <a
                href="https://github.com/cvviews"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs"
                aria-label="GitHub"
              >
                GH
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Produto
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/#upload-cv" className="hover:text-gray-950 transition-colors">Carregar CV</Link></li>
              <li><Link href="/chat" className="hover:text-gray-950 transition-colors">Chat</Link></li>
              <li><Link href="/#pricing" className="hover:text-gray-950 transition-colors">Preços</Link></li>
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">Sobre nós</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Empresa
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-950 transition-colors">Sobre nós</Link></li>
              <li><a href="mailto:talento@cvviews.pt" className="hover:text-gray-950 transition-colors">Carreiras</a></li>
              <li><a href="mailto:contacto@cvviews.pt" className="hover:text-gray-950 transition-colors">Contactos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/privacidade" className="hover:text-gray-950 transition-colors">Política de privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-gray-950 transition-colors">Termos de serviço</Link></li>
              <li><Link href="/privacidade" className="hover:text-gray-950 transition-colors">Segurança</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 CVViews. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacidade" className="hover:text-gray-900 transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-gray-900 transition-colors">Termos</Link>
            <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
