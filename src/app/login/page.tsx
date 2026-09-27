"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { setStoredUser } from "@/lib/userSession";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setStoredUser({ name: email.split("@")[0] || "Utilizador", email });
      setIsLoading(false);
      router.push("/");
    }, 600);
  };

  return (
    <main className="auth-page-enter portugal-atmosphere min-h-screen bg-[#f4efe6] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-gray-200">
      {/* Full-Page Centered CVViews Split Container */}
      <div
        className="auth-card-enter w-full max-w-4xl bg-[#fcf8ef] rounded-3xl border border-black/[0.1] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]"
      >
        
        {/* LEFT COLUMN: Black Branding Panel (Tailored to CVViews Site) */}
        <div className="auth-panel-enter md:col-span-5 bg-[#0a0a0a] text-white p-8 sm:p-10 flex flex-col justify-between">
          
          {/* Top Brand Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit" aria-label="CVViews Home">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Logo size={20} color="#ffffff" />
            </div>
            <span className="text-[17px] font-black font-hero-title tracking-[-0.03em] text-white uppercase flex items-center leading-none">
              <span>CV</span>
              <span className="font-semibold text-gray-400 ml-[0.5px]">VIEWS</span>
            </span>
          </Link>

          {/* Middle Headline */}
          <div className="my-auto py-10">
            <h2 className="text-2xl sm:text-3xl font-black font-hero-title text-white leading-[1.08] mb-3">
              <span className="block">Transforme o seu CV</span>
              <span className="font-serif-italic text-3xl sm:text-4xl font-normal leading-tight">
                numa oportunidade irresistível.
              </span>
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Identifique falhas ATS, receba reformulações práticas e prepare-se com simulações de entrevistas adaptadas.
            </p>
          </div>

          {/* Bottom Footnote (Clean metric without avatar circles) */}
          <div className="text-[11px] text-gray-500 font-medium">
            Mais de 50 000 candidatos preparados para entrevistas
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Auth Form */}
        <div className="auth-form-enter md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-[#fcf8ef]">
          <div className="max-w-sm w-full mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-950 mb-1">
                Bem-vindo de volta
              </h1>
              <p className="text-xs text-gray-500">
                Aceda ao seu painel e às auditorias guardadas
              </p>
            </div>

            {loginSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-emerald-950 mb-1">Sessão iniciada com sucesso</h3>
                <p className="text-xs text-emerald-700 mb-4">A redirecioná-lo para o CVViews...</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-950 text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <span>Ir para o CVViews</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div>
                {/* Social Login Buttons: Google & GitHub Side-by-Side */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <button
                    type="button"
                    aria-label="Iniciar sessão com o Google"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-black/[0.08] text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Iniciar sessão com o GitHub"
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-black/[0.08] text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-gray-900 shrink-0" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>

                {/* Divider: OR CONTINUE WITH EMAIL */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="border-t border-black/[0.08] w-full" />
                  <span className="bg-white px-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider absolute">
                    ou continuar com e-mail
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Email address */}
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Endereço de e-mail
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@empresa.pt"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 border border-black/[0.1] focus:border-black focus:bg-white text-xs text-gray-950 placeholder-gray-400 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        Palavra-passe
                      </label>
                      <a
                        href="mailto:suporte@cvviews.pt?subject=Recuperação%20de%20palavra-passe"
                        className="text-xs text-gray-500 hover:text-gray-950 transition-colors"
                      >
                        Esqueceu-se da palavra-passe?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-gray-50 border border-black/[0.1] focus:border-black focus:bg-white text-xs text-gray-950 placeholder-gray-400 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#0a0a0a] hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Iniciar sessão</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher */}
                <div className="mt-6 text-center text-xs text-gray-500">
                  <span>Ainda não tem uma conta? </span>
                  <Link
                    href="/signup"
                    className="font-bold text-gray-950 hover:underline transition-all"
                  >
                    Criar conta gratuita
                  </Link>
                </div>

                {/* Terms of Service Notice */}
                <p className="mt-4 text-[10px] text-center text-gray-400 leading-relaxed">
                  Ao continuar, aceita os nossos <Link href="/termos" className="underline hover:text-gray-700">Termos de serviço</Link> e a <Link href="/privacidade" className="underline hover:text-gray-700">Política de privacidade</Link>.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
