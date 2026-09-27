"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/Logo";
import { SiteHeader } from "@/components/SiteHeader";

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
      <SiteHeader />

      {/* Main Content */}
      <main className="flex-1 page-enter">

        {/* Hero */}
        <section className="portugal-atmosphere border-b border-black/[0.07] bg-[#f4efe6] py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-4" data-reveal>
              Sobre o CVViews
            </span>
            <h1 className="font-hero-title text-4xl sm:text-5xl font-black text-gray-950 mb-6 leading-[1.08] max-w-4xl" data-reveal>
              <span className="block">Criado para ajudar profissionais</span>
              <span className="font-serif-italic text-4xl sm:text-5xl font-normal leading-[1.05] text-gray-900">
                a passar pelos filtros ATS e a destacar-se em entrevistas decisivas.
              </span>
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-2xl" data-reveal>
              Mais de 75% dos candidatos qualificados são filtrados antes de um recrutador ler o seu CV.
              O CVViews equilibra as oportunidades com diagnósticos baseados em IA e preparação para entrevistas.
            </p>

            {/* Stats row */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-xl" data-reveal>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">98%</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">Precisão da análise ATS</div>
              </div>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">50k+</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">CV analisados</div>
              </div>
              <div>
                <div className="text-4xl font-black text-gray-950 mb-1">3.2x</div>
                <div className="text-xs text-gray-500 font-medium leading-snug">Aumento médio de contactos</div>
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
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Nesta página</p>
                {[
                  { label: "A nossa missão",   href: "#mission" },
                  { label: "Porque começámos", href: "#origin" },
                  { label: "Como funciona",   href: "#how" },
                  { label: "Equipa",           href: "#team" },
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
                <h2 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">A nossa missão</h2>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Acreditamos que pessoas talentosas não devem ser impedidas por algoritmos de recrutamento opacos.
                  A nossa missão é democratizar o acesso às melhores oportunidades profissionais, dando a cada
                  candidato as ferramentas para compreender a caixa negra dos ATS.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  O CVViews fornece auditorias sistemáticas de CV, diagnósticos estruturais precisos e um assistente
                  interativo de prática, criado para transformar qualificações em histórias profissionais convincentes.
                </p>
              </div>

              {/* Origin */}
              <div id="origin" className="border-t border-black/[0.07] pt-12" data-reveal>
                <h2 className="text-2xl font-black text-gray-950 mb-4 tracking-tight">Porque começámos</h2>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  Depois de vermos inúmeros profissionais qualificados serem rejeitados por problemas de formatação,
                  e não por falta de competências, a nossa equipa de antigos recrutadores e engenheiros de IA criou o CVViews.
                </p>
                <p className="text-base text-gray-600 leading-relaxed">
                  Treinámos o nosso motor com milhões de CV bem-sucedidos e rejeitados para lhe dar uma vantagem
                  decisiva no mercado de trabalho atual — não para manipular o sistema, mas para o ajudar a apresentar
                  o seu verdadeiro valor com clareza e precisão.
                </p>
              </div>

              {/* How It Works */}
              <div id="how" className="border-t border-black/[0.07] pt-12">
                <h2 className="text-2xl font-black text-gray-950 mb-8 tracking-tight" data-reveal>Como funciona</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { n: "1", title: "Carregar CV",      desc: "Arraste e largue o seu CV em PDF ou DOCX. Processamo-lo em segundos." },
                    { n: "2", title: "Análise ATS imediata",   desc: "O nosso motor identifica palavras-chave em falta, erros de formatação e secções ilegíveis." },
                    { n: "3", title: "Corrigir e otimizar",     desc: "Siga sugestões passo a passo para reformular pontos e quantificar o seu impacto." },
                    { n: "4", title: "Prática de entrevistas", desc: "Utilize o Chat com IA para simular entrevistas reais com base no seu perfil otimizado." },
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
                    <h3 className="text-xl font-black text-white mb-1">Pronto para começar?</h3>
                    <p className="text-sm text-gray-400">Carregue o seu CV e obtenha a sua pontuação ATS em segundos.</p>
                  </div>
                  <Link href="/signup"
                    className="liquid-glass-button shrink-0 inline-flex items-center gap-3 pl-6 pr-3 py-3 rounded-full text-white font-bold text-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group">
                    <span>Começar gratuitamente</span>
                    <span className="liquid-glass-icon w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-4 h-4 stroke-[2.8] text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
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
                  Diagnóstico preciso de CV, otimização para ATS e prática de entrevistas adaptadas à função.
            </p>
            <div className="flex gap-2.5">
              <a href="https://www.linkedin.com/company/cvviews" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="LinkedIn">in</a>
              <a href="https://x.com/cvviews" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="Twitter">X</a>
              <a href="https://github.com/cvviews" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl bg-gray-50 border border-black/[0.08] flex items-center justify-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-100 transition-all shadow-xs" aria-label="GitHub">GH</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Produto</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="/#upload-cv" className="hover:text-gray-950 transition-colors">Carregar CV</Link></li>
              <li><Link href="/chat" className="hover:text-gray-950 transition-colors">Chat</Link></li>
                  <li><Link href="/#pricing" className="hover:text-gray-950 transition-colors">Preços</Link></li>
                  <li><Link href="/about" className="hover:text-gray-950 transition-colors">Sobre nós</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Empresa</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="/about" className="hover:text-gray-950 transition-colors">Sobre nós</Link></li>
                  <li><a href="mailto:talento@cvviews.pt" className="hover:text-gray-950 transition-colors">Carreiras</a></li>
                  <li><a href="mailto:contacto@cvviews.pt" className="hover:text-gray-950 transition-colors">Contactos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-gray-900 uppercase mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
                  <li><Link href="/privacidade" className="hover:text-gray-950 transition-colors">Política de privacidade</Link></li>
                  <li><Link href="/termos" className="hover:text-gray-950 transition-colors">Termos de serviço</Link></li>
                  <li><a href="/privacidade" className="hover:text-gray-950 transition-colors">Segurança</a></li>
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
