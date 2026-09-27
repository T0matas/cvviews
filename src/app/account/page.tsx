"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText, GitCompare, Trash2, UserCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import type { DiagnosticData } from "@/components/CVUploadSection";
import { ANALYSIS_STORAGE_KEY, getStoredUser, StoredUser } from "@/lib/userSession";

interface SavedAnalysis {
  id: string;
  createdAt: string;
  data: DiagnosticData;
}

export default function AccountPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setUser(getStoredUser());
    const stored = window.localStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (stored) {
      try {
        setAnalyses(JSON.parse(stored) as SavedAnalysis[]);
      } catch {
        window.localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      }
    }
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-2));
  };

  const deleteAnalysis = (id: string) => {
    const next = analyses.filter((analysis) => analysis.id !== id);
    setAnalyses(next);
    setSelectedIds((current) => current.filter((item) => item !== id));
    window.localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(next));
  };

  const exportAnalysis = (analysis: SavedAnalysis) => {
    const blob = new Blob([JSON.stringify(analysis.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${analysis.data.fileName.replace(/\.[^.]+$/, "")}-relatorio.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selected = analyses.filter((analysis) => selectedIds.includes(analysis.id));

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f4efe6] text-gray-950">
        <SiteHeader />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
          <UserCircle className="mb-4 h-12 w-12 text-gray-400" />
          <h1 className="text-3xl font-black">A sua conta</h1>
          <p className="mt-3 text-sm text-gray-500">Inicie sessão para consultar o histórico dos seus CVs.</p>
          <Link href="/login" className="mt-7 rounded-full bg-gray-950 px-5 py-3 text-sm font-bold text-white">Iniciar sessão</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4efe6] text-gray-950">
      <SiteHeader />
      <div className="page-enter mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Área pessoal</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Olá, {user.name}</h1>
            <p className="mt-2 text-sm text-gray-500">{user.email}</p>
          </div>
          <Link href="/#upload-cv" className="inline-flex w-fit items-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-bold text-white">Analisar novo CV</Link>
        </div>

        <section className="rounded-3xl border border-black/[0.1] bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Histórico de análises</h2>
              <p className="mt-1 text-sm text-gray-500">Selecione até dois CVs para comparar as pontuações.</p>
            </div>
            {selected.length === 2 && <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-700"><GitCompare className="h-4 w-4" />Comparação ativa</div>}
          </div>

          {analyses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/[0.15] px-6 py-14 text-center">
              <FileText className="mx-auto h-9 w-9 text-gray-400" />
              <p className="mt-3 text-sm font-bold">Ainda não tem análises guardadas</p>
              <Link href="/#upload-cv" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Carregar o primeiro CV</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div key={analysis.id} className="flex flex-col gap-4 rounded-2xl border border-black/[0.1] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex min-w-0 items-center gap-3">
                    <input type="checkbox" checked={selectedIds.includes(analysis.id)} onChange={() => toggleSelected(analysis.id)} className="h-4 w-4 accent-black" />
                    <FileText className="h-5 w-5 shrink-0 text-gray-500" />
                    <span className="min-w-0"><strong className="block truncate text-sm">{analysis.data.fileName}</strong><span className="text-xs text-gray-500">{new Date(analysis.createdAt).toLocaleDateString("pt-PT")} · {analysis.data.roleTarget}</span></span>
                  </label>
                  <div className="flex items-center gap-3 pl-7 sm:pl-0">
                    <span className="rounded-lg bg-gray-950 px-3 py-2 text-sm font-black text-white">{analysis.data.score}/100</span>
                    <button type="button" onClick={() => exportAnalysis(analysis)} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100" aria-label="Exportar relatório"><Download className="h-4 w-4" /></button>
                    <button type="button" onClick={() => deleteAnalysis(analysis.id)} className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-700" aria-label="Eliminar CV"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {selected.length === 2 && (
          <section className="mt-6 rounded-3xl border border-black/[0.1] bg-gray-950 p-5 text-white sm:p-8">
            <h2 className="text-xl font-black">Comparar versões</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {selected.map((analysis) => <div key={analysis.id} className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="truncate text-sm font-bold">{analysis.data.fileName}</p><p className="mt-4 text-4xl font-black">{analysis.data.score}<span className="text-sm font-normal text-gray-400">/100</span></p><p className="mt-2 text-xs text-gray-400">ATS {analysis.data.atsScore}% · Impacto {analysis.data.impactScore}%</p></div>)}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-3xl border border-black/[0.1] bg-white p-5 sm:p-8">
          <h2 className="text-xl font-black">Dados pessoais</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">Os dados desta demonstração são guardados apenas neste navegador. Elimine as análises acima para remover os relatórios guardados.</p>
        </section>
      </div>
    </main>
  );
}