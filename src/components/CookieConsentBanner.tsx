"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COOKIE_PREFERENCE_KEY,
  COOKIE_PREFERENCE_UPDATED_EVENT,
  saveCookiePreference,
} from "@/lib/cookiePreferences";

export function CookieConsentBanner() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let showFrame: number | undefined;
    let hideTimeout: number | undefined;

    const showBanner = () => {
      setShouldRender(true);
      showFrame = window.requestAnimationFrame(() => setIsVisible(true));
    };

    try {
      if (window.localStorage.getItem(COOKIE_PREFERENCE_KEY) === null) showBanner();
    } catch {
      showBanner();
    }

    const handlePreferenceUpdate = () => {
      setIsVisible(false);
      hideTimeout = window.setTimeout(() => setShouldRender(false), 500);
    };

    window.addEventListener(COOKIE_PREFERENCE_UPDATED_EVENT, handlePreferenceUpdate);
    return () => {
      window.removeEventListener(COOKIE_PREFERENCE_UPDATED_EVENT, handlePreferenceUpdate);
      if (showFrame !== undefined) window.cancelAnimationFrame(showFrame);
      if (hideTimeout !== undefined) window.clearTimeout(hideTimeout);
    };
  }, []);

  const choosePreference = (allowOptional: boolean) => {
    try {
      saveCookiePreference(allowOptional);
    } catch {
      setIsVisible(false);
      window.setTimeout(() => setShouldRender(false), 500);
    }
  };

  if (!shouldRender) return null;

  return (
    <aside
      className={`cookie-banner fixed inset-x-0 bottom-0 z-[60] border-t-2 border-t-[#cfaa63] border-black/[0.1] bg-[#f4efe6]/[0.98] ${isVisible ? "cookie-banner-visible" : "pointer-events-none"}`}
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      aria-hidden={!isVisible}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
        <div className="max-w-4xl">
          <h2 id="cookie-consent-title" className="text-sm font-extrabold text-gray-950">
            Preferências de cookies
          </h2>
          <p id="cookie-consent-description" className="mt-2 text-sm leading-6 text-gray-600">
            A versão atual do CVViews não integra cookies de análise ou publicidade. Pode guardar a sua escolha para opções opcionais; esta preferência fica no navegador e não ativa rastreamento.
          </p>
          <Link href="/cookies" className="mt-2 inline-block text-xs font-semibold text-gray-700 underline decoration-black/20 underline-offset-4 hover:text-gray-950">
            Saber mais sobre cookies
          </Link>
        </div>

        <div className="grid shrink-0 gap-2 sm:w-56">
          <button
            type="button"
            onClick={() => choosePreference(true)}
            className="cookie-shine-button min-h-11 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
          >
            <span>Aceitar opcionais</span>
          </button>
          <button
            type="button"
            onClick={() => choosePreference(false)}
            className="cookie-shine-button min-h-11 rounded-full border border-black/[0.16] bg-transparent px-5 py-2.5 text-sm font-bold text-gray-800 transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
          >
            <span>Rejeitar opcionais</span>
          </button>
        </div>
      </div>
    </aside>
  );
}