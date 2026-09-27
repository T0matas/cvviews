"use client";

import { useEffect, useState } from "react";
import { COOKIE_PREFERENCE_KEY, saveCookiePreference } from "@/lib/cookiePreferences";

export function CookiePreference() {
  const [allowOptional, setAllowOptional] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      setAllowOptional(window.localStorage.getItem(COOKIE_PREFERENCE_KEY) === "true");
    } catch {
      setStatus("O navegador não permite guardar preferências localmente.");
    }
  }, []);

  const savePreference = () => {
    try {
      saveCookiePreference(allowOptional);
      setStatus("Preferência guardada neste navegador.");
    } catch {
      setStatus("Não foi possível guardar a preferência neste navegador.");
    }
  };

  return (
    <section className="rounded-lg border border-black/[0.12] bg-white/70 p-5" aria-labelledby="cookie-preference-title" data-reveal>
      <h2 id="cookie-preference-title" className="text-lg font-bold text-gray-950">A sua preferência</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        Não existem ferramentas de análise ou publicidade integradas nesta versão. Esta escolha fica guardada localmente e não ativa rastreamento.
      </p>
      <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={allowOptional}
          onChange={(event) => {
            setAllowOptional(event.target.checked);
            setStatus("");
          }}
          className="mt-1 h-4 w-4 accent-gray-900"
        />
        <span>Guardar a minha preferência para cookies opcionais, caso venham a ser disponibilizados.</span>
      </label>
      <button
        type="button"
        onClick={savePreference}
        className="mt-5 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
      >
        Guardar preferência
      </button>
      <p className="mt-3 min-h-5 text-xs text-gray-500" role="status" aria-live="polite">{status}</p>
    </section>
  );
}