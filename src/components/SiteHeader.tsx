"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, UserCircle, X } from "lucide-react";
import { BrandLogo } from "@/components/ui/Logo";
import { clearStoredUser, getStoredUser, StoredUser } from "@/lib/userSession";

interface SiteHeaderProps {
  compact?: boolean;
}

export function SiteHeader({ compact = false }: SiteHeaderProps) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    window.addEventListener("cvviews-auth-change", syncUser);
    return () => window.removeEventListener("cvviews-auth-change", syncUser);
  }, []);

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 h-[66px] border-b border-black/[0.08] bg-[#fcf8ef]/75 backdrop-blur-md shadow-none">
      <div className={`${compact ? "w-full px-3 sm:px-4 md:px-6" : "max-w-7xl mx-auto px-4 sm:px-6"} h-full flex items-center justify-between`}>
        <Link href="/" aria-label="CVViews Home">
          <BrandLogo size={27} />
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-8 sm:flex">
            <Link href="/#upload-cv" onClick={closeMenus} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors">Carregar CV</Link>
            <Link href="/about" onClick={closeMenus} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors">Sobre nós</Link>
            <Link href="/chat" onClick={closeMenus} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors">Chat</Link>
            <Link href="/#pricing" onClick={closeMenus} className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-950 transition-colors">Preços</Link>
          </div>

          {user ? (
            <div className="relative">
              <button type="button" onClick={() => setAccountOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-full border border-black/[0.12] bg-white px-2.5 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-100" aria-expanded={accountOpen}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-950 text-[10px] text-white">{initials}</span>
                <span className="hidden max-w-24 truncate sm:block">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {accountOpen && (
                <div className="menu-enter absolute right-0 top-12 z-50 w-52 rounded-xl border border-black/[0.1] bg-white p-2 shadow-xl">
                  <Link href="/account" onClick={closeMenus} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100"><UserCircle className="h-4 w-4" />A minha conta</Link>
                  <button type="button" onClick={() => { clearStoredUser(); closeMenus(); }} className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-100">Terminar sessão</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Link href="/login" className="text-xs font-semibold px-4 py-2 text-gray-700 hover:text-gray-950 transition-colors border border-black/[0.12] rounded-full hover:bg-gray-100/80">Iniciar sessão</Link>
              <Link href="/signup" className="text-xs font-bold px-4 py-2 rounded-full bg-gray-950 hover:bg-gray-800 text-white transition-all shadow-xs hover:shadow-md">Criar conta</Link>
            </div>
          )}

          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/[0.1] text-gray-800 sm:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu-enter absolute left-0 right-0 top-full z-[60] border-b border-black/[0.1] bg-[#fcf8ef] p-4 shadow-xl sm:hidden">
            <div className="flex flex-col gap-1">
              <Link href="/#upload-cv" onClick={closeMenus} className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Carregar CV</Link>
              <Link href="/about" onClick={closeMenus} className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Sobre nós</Link>
              <Link href="/chat" onClick={closeMenus} className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Chat</Link>
              <Link href="/#pricing" onClick={closeMenus} className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Preços</Link>
              {!user && (
                <div className="mt-2 flex flex-col gap-2 border-t border-black/[0.08] pt-4">
                  <Link href="/login" onClick={closeMenus} className="rounded-full border border-black/[0.12] px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100">Iniciar sessão</Link>
                  <Link href="/signup" onClick={closeMenus} className="rounded-full bg-gray-950 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-gray-800">Criar conta</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
