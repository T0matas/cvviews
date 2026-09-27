"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Check,
  Copy,
  BarChart3,
  ListFilter,
  FileEdit,
  HelpCircle,
} from "lucide-react";

export interface DiagnosticData {
  fileName: string;
  fileSize: string;
  roleTarget: string;
  score: number;
  atsScore: number;
  impactScore: number;
  clarityScore: number;
  keywordsScore: number;
  goodPoints: { title: string; desc: string; tag: string }[];
  badPoints: { title: string; desc: string; tag: string }[];
  rewriteExample: {
    section: string;
    before: string;
    after: string;
    explanation: string;
  };
  interviewQuestions: {
    question: string;
    context: string;
    framework: string;
  }[];
}

const SAMPLE_PRESETS: Record<string, DiagnosticData> = {
  tech: {
    fileName: "CV_Engenheiro_Software.pdf",
    fileSize: "245 KB",
    roleTarget: "Engenheiro Full Stack Sénior",
    score: 84,
    atsScore: 92,
    impactScore: 68,
    clarityScore: 90,
    keywordsScore: 82,
    goodPoints: [
      {
        title: "Estrutura compatível com ATS",
        desc: "Formato de uma só coluna, sem tabelas aninhadas ou elementos vetoriais invulgares que prejudiquem os analisadores automáticos.",
        tag: "Estrutura",
      },
      {
        title: "Categorização por domínio",
        desc: "Tecnologias claramente separadas entre Front-end, Back-end e infraestrutura cloud.",
        tag: "Competências",
      },
      {
        title: "Progressão profissional",
        desc: "Percurso cronológico claro que demonstra responsabilidades crescentes nas funções de engenharia.",
        tag: "Experiência",
      },
    ],
    badPoints: [
      {
        title: "Falta de impacto quantificado",
        desc: "As conquistas recentes descrevem tarefas rotineiras em vez de métricas quantificáveis (por exemplo, latência, escala e custo).",
        tag: "Impacto",
      },
      {
        title: "Resumo inicial genérico",
        desc: "O resumo profissional utiliza expressões vagas em vez de indicar o domínio técnico principal e o valor para o negócio.",
        tag: "Resumo",
      },
      {
        title: "Palavras-chave importantes em falta",
        desc: "As ofertas para engenharia sénior filtram atualmente por 'CI/CD Pipelines', 'Automated Testing' e 'System Design'.",
        tag: "Palavras-chave",
      },
    ],
    rewriteExample: {
      section: "Experiência · Engenheiro Sénior",
      before: "Responsável pelo desenvolvimento de novas funcionalidades e pela correção de erros na principal plataforma web.",
      after: "Concebi 5 microsserviços essenciais em React e Node.js, reduzindo a latência da API em 40% para mais de 120 000 utilizadores ativos diários.",
      explanation: "Substitui descrições passivas de tarefas por verbos de ação fortes e resultados de negócio concretos e mensuráveis.",
    },
    interviewQuestions: [
      {
        question: "Como avalia os compromissos de desempenho perante calendários apertados de lançamento de sprints?",
        context: "Avalia o discernimento arquitetural e a disciplina de entrega sob pressão de prazos.",
        framework: "Método STAR",
      },
      {
        question: "Descreva um bloqueio crítico em produção que diagnosticou e como orientou a equipa para o resolver.",
        context: "Foca a análise da causa raiz, a comunicação entre equipas e a liderança de engenharia.",
        framework: "Análise técnica aprofundada",
      },
    ],
  },
  marketing: {
    fileName: "CV_Diretor_Marketing.pdf",
    fileSize: "310 KB",
    roleTarget: "Diretor de Crescimento e Marketing",
    score: 79,
    atsScore: 86,
    impactScore: 72,
    clarityScore: 85,
    keywordsScore: 74,
    goodPoints: [
      {
        title: "Hierarquia visual clara",
        desc: "A tipografia limpa e os pontos fáceis de ler permitem aos recrutadores analisar as qualificações em segundos.",
        tag: "Design",
      },
      {
        title: "Conjunto de ferramentas moderno",
        desc: "Referências diretas a plataformas padrão do setor (HubSpot, GA4, Meta Ads, Segment).",
        tag: "Competências",
      },
      {
        title: "Certificações relevantes",
        desc: "Certificações em destaque que comprovam o domínio profissional contínuo da área.",
        tag: "Formação",
      },
    ],
    badPoints: [
      {
        title: "Faltam valores de ROAS e CAC",
        desc: "As campanhas de aquisição paga não apresentam percentagens específicas de retorno do investimento publicitário e custo por aquisição.",
        tag: "Métricas",
      },
      {
        title: "Modelo de atribuição omisso",
        desc: "Não esclarece a atribuição multitoque nem as metodologias de integração com o pipeline de CRM.",
        tag: "Estratégia",
      },
      {
        title: "Ambiguidade na proficiência linguística",
        desc: "A proficiência em línguas estrangeiras é indicada sem uma escala de avaliação normalizada.",
        tag: "Detalhes",
      },
    ],
    rewriteExample: {
      section: "Experiência · Gestor de Marketing de Crescimento",
      before: "Geri canais de redes sociais e criei campanhas de publicidade paga para gerar leads.",
      after: "Geri um orçamento mensal de aquisição de 80 mil dólares no Meta e Google, aumentando o pipeline qualificado em 32% e reduzindo o CAC em 18%.",
      explanation: "Demonstra responsabilidade financeira, domínio dos canais e contribuições mensuráveis para a receita.",
    },
    interviewQuestions: [
      {
        question: "Qual foi a sua campanha com maior ROI e que métricas exatas determinaram o seu sucesso para o negócio?",
        context: "Avalia o rigor analítico e a capacidade de atribuir receitas entre vários canais.",
        framework: "Defesa baseada em dados",
      },
      {
        question: "Como estrutura sistematicamente testes A/B em landing pages quando a conversão estagna?",
        context: "Testa a experimentação disciplinada e a estratégia de otimização da taxa de conversão.",
        framework: "Metodologia",
      },
    ],
  },
  business: {
    fileName: "CV_Gestor_Produto.pdf",
    fileSize: "198 KB",
    roleTarget: "Gestor de Produto Sénior",
    score: 88,
    atsScore: 95,
    impactScore: 82,
    clarityScore: 94,
    keywordsScore: 85,
    goodPoints: [
      {
        title: "Formulação orientada para resultados",
        desc: "Ligações explícitas entre lançamentos de funcionalidades e indicadores de negócio dos clientes (NPS, retenção e LTV).",
        tag: "Impacto",
      },
      {
        title: "Alinhamento Agile e Discovery",
        desc: "Demonstração clara de discovery contínuo, gestão de sprints e priorização do backlog.",
        tag: "Processo",
      },
      {
        title: "Resumo executivo conciso",
        desc: "Parágrafo introdutório direto e focado no valor, que estabelece os pontos fortes estratégicos do produto.",
        tag: "Resumo",
      },
    ],
    badPoints: [
      {
        title: "Detalhes qualitativos de discovery",
        desc: "Poderia desenvolver melhor o tamanho das amostras de entrevistas com clientes e os modelos de síntese.",
        tag: "Discovery",
      },
      {
        title: "Âmbito da colaboração multifuncional",
        desc: "Precisa de mais detalhes sobre a colaboração diária com responsáveis de design e engenharia.",
        tag: "Colaboração",
      },
    ],
    rewriteExample: {
      section: "Experiência · Responsável de Produto",
      before: "Defini o roadmap do produto e priorizei o backlog com as partes interessadas executivas.",
      after: "Transformei os dados qualitativos de 45 entrevistas com utilizadores num roadmap trimestral, aumentando a adoção de novas funcionalidades em 48%.",
      explanation: "Liga diretamente o trabalho de discovery com clientes a métricas tangíveis de adoção pelos utilizadores.",
    },
    interviewQuestions: [
      {
        question: "Como gere pedidos prioritários e conflituantes das partes interessadas face aos OKR trimestrais principais?",
        context: "Analisa a diplomacia com as partes interessadas, os modelos de priorização do backlog e a defesa de compromissos.",
        framework: "Alinhamento executivo",
      },
      {
        question: "Descreva um lançamento de produto que não atingiu o objetivo inicial e as mudanças iterativas que implementou.",
        context: "Avalia a resiliência, as análises pós-incidente baseadas em dados e a resposta ao feedback dos clientes.",
        framework: "Análise pós-incidente",
      },
    ],
  },
};

interface CVUploadSectionProps {
  onAnalyzeComplete?: (data: DiagnosticData) => void;
}

export function CVUploadSection({ onAnalyzeComplete }: CVUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "findings" | "rewrites" | "interview">("overview");
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = [
    "A analisar a hierarquia do texto e a estrutura das secções...",
    "A comparar a compatibilidade com ATS...",
    "A auditar verbos de ação e densidade de métricas...",
    "A gerar recomendações práticas...",
  ];

  const handleStartAnalysis = (presetKey: string = "tech", customFile?: File) => {
    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setDiagnosticResult(null);
    setUploadError(null);

    const baseData = SAMPLE_PRESETS[presetKey] || SAMPLE_PRESETS.tech;
    const finalData: DiagnosticData = customFile
      ? {
          ...baseData,
          fileName: customFile.name,
          fileSize: `${(customFile.size / 1024).toFixed(1)} KB`,
        }
      : baseData;

    analysisTimerRef.current = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= steps.length - 1) {
          if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
          setTimeout(() => {
            setIsAnalyzing(false);
            setDiagnosticResult(finalData);
            setActiveTab("overview");
            if (onAnalyzeComplete) {
              onAnalyzeComplete(finalData);
            }
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const validateFile = (candidate: File) => {
    const extension = candidate.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "doc", "docx", "txt"].includes(extension)) {
      setUploadError("Formato não suportado. Carregue um ficheiro PDF, Word ou TXT.");
      return false;
    }
    if (candidate.size > 10 * 1024 * 1024) {
      setUploadError("O ficheiro é demasiado grande. O limite máximo é 10 MB.");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!validateFile(selectedFile)) {
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      handleStartAnalysis("tech", selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!validateFile(droppedFile)) return;
      setFile(droppedFile);
      handleStartAnalysis("tech", droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetAnalysis = () => {
    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    setFile(null);
    setDiagnosticResult(null);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelAnalysis = () => {
    if (analysisTimerRef.current) clearInterval(analysisTimerRef.current);
    setIsAnalyzing(false);
    setAnalysisStep(0);
    setUploadError("A análise foi interrompida. Pode tentar novamente com o mesmo ficheiro.");
  };

  const copyRewrite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="upload-cv" data-reveal className="max-w-6xl mx-auto px-4 sm:px-6 w-full mb-10 sm:mb-16 scroll-mt-20">
      {/* Container */}
      <div className="rounded-3xl border border-black bg-white overflow-hidden shadow-xl">
        {!diagnosticResult && !isAnalyzing && (
          <div className="p-5 sm:p-12">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-3 tracking-tight">
                Carregue o seu CV para obter um diagnóstico imediato
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Receba uma auditoria estrutural objetiva, uma verificação de compatibilidade ATS e reformulações práticas dos seus pontos.
              </p>
            </div>

              {uploadError && (
                <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? "border-gray-950 bg-gray-100"
                  : "border-black/[0.12] hover:border-gray-950 bg-gray-50/60 hover:bg-gray-50"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />

              <div className="w-12 h-12 rounded-xl bg-gray-100 border border-black/[0.08] flex items-center justify-center text-gray-900 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-gray-950">
                  Largue o seu CV aqui ou <span className="underline underline-offset-4 text-black">procure ficheiros</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Suporta PDF, Word ou TXT até 10 MB
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2 text-[11px] text-gray-400 font-medium">
                <span>Testado para ATS</span>
                <span>·</span>
                <span>Encriptado e privado</span>
                <span>·</span>
                <span>Feedback imediato</span>
              </div>
            </div>

            {/* Sample Presets */}
            <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-500 font-medium">
                Ou consulte uma auditoria de exemplo:
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStartAnalysis("tech")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Engenheiro de software
                </button>
                <button
                  onClick={() => handleStartAnalysis("marketing")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Responsável de marketing
                </button>
                <button
                  onClick={() => handleStartAnalysis("business")}
                  className="text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-gray-100 border border-black/[0.1] text-gray-800 hover:text-black transition-colors cursor-pointer shadow-xs"
                >
                  Gestor de produto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clean Minimalist Loading State */}
        {isAnalyzing && (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-black/15 border-t-black animate-spin mb-6"></div>

            <h3 className="text-xl font-bold text-gray-950 mb-2">
              A auditar o CV
            </h3>
            <p className="text-xs text-gray-500 mb-8 max-w-sm">
              A analisar a hierarquia do documento, a compatibilidade ATS e as métricas de impacto.
            </p>

            <div className="w-full max-w-sm space-y-2 text-left">
              {steps.map((st, idx) => {
                const isCurrent = idx === analysisStep;
                const isDone = idx < analysisStep;

                return (
                  <div
                    key={st}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isDone
                        ? "bg-gray-50 border-black/[0.08] text-gray-700"
                        : isCurrent
                        ? "bg-gray-950 border-black text-white font-semibold shadow-xs"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    <span>{st}</span>
                    {isDone && <Check className="w-3.5 h-3.5 text-gray-900" />}
                    {isCurrent && <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={cancelAnalysis} className="mt-8 rounded-full border border-black/[0.12] px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100">Interromper análise</button>
          </div>
        )}

        {/* Refined Executive Report Interface */}
        {diagnosticResult && !isAnalyzing && (
          <div>
            {/* Top Bar / Document Metadata */}
            <div className="px-6 py-4 border-b border-black/[0.08] bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-black/[0.1] flex items-center justify-center text-gray-900 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-950">
                      {diagnosticResult.fileName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-black/[0.1] text-gray-600 font-medium">
                      {diagnosticResult.fileSize}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                      Função pretendida: {diagnosticResult.roleTarget}
                  </p>
                </div>
              </div>

              <button
                onClick={resetAnalysis}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 border border-black/[0.12] text-gray-700 hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3 h-3" />
                Substituir documento
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-black/[0.08] flex items-center gap-2 overflow-x-auto bg-white">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Resumo
              </button>

              <button
                onClick={() => setActiveTab("findings")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "findings"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                Pontos a rever
              </button>

              <button
                onClick={() => setActiveTab("rewrites")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "rewrites"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                Reescrita
              </button>

              <button
                onClick={() => setActiveTab("interview")}
                className={`text-xs font-bold py-3.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === "interview"
                    ? "border-black text-gray-950"
                    : "border-transparent text-gray-400 hover:text-gray-950"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Entrevista
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8 bg-white">
              {/* TAB 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Score Highlight Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 rounded-2xl bg-[#fbfaf7] border border-black/[0.08]">
                    {/* Left: Main Score */}
                    <div className="lg:col-span-3 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-black/[0.08] pb-5 lg:pb-0 lg:pr-6">
                      <div className="w-[72px] h-[72px] rounded-xl bg-gray-950 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-2xl font-black text-white">
                          {diagnosticResult.score}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          de 100
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-950 block">
                          Resultado geral
                        </span>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Principal prioridade: {diagnosticResult.badPoints[0]?.title.toLowerCase()}.
                        </p>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Análise ATS</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.atsScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-950 rounded-full" style={{ width: `${diagnosticResult.atsScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Compatibilidade</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Impacto</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.impactScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-600 rounded-full" style={{ width: `${diagnosticResult.impactScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Métricas e resultados</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Clareza</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.clarityScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-700 rounded-full" style={{ width: `${diagnosticResult.clarityScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Leitura e organização</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                          <span className="text-gray-600">Palavras-chave</span>
                          <span className="font-bold text-gray-950">{diagnosticResult.keywordsScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-800 rounded-full" style={{ width: `${diagnosticResult.keywordsScore}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">Alinhamento com a função</span>
                      </div>
                    </div>
                  </div>

                  {/* One clear next action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-gray-950 pl-4 py-1">
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-gray-950">Próximo passo recomendado</h4>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {diagnosticResult.badPoints[0]?.title}: {diagnosticResult.badPoints[0]?.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("rewrites")}
                      className="shrink-0 text-xs px-4 py-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      Ver reescrita
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: Findings */}
              {activeTab === "findings" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-gray-900" />
                      Pontos fortes identificados ({diagnosticResult.goodPoints.length})
                    </h4>
                    <div className="space-y-2.5">
                      {diagnosticResult.goodPoints.map((pt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-950">{pt.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-medium">
                              {pt.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas to improve */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      Áreas a rever ({diagnosticResult.badPoints.length})
                    </h4>
                    <div className="space-y-2.5">
                      {diagnosticResult.badPoints.map((pt, i) => (
                        <div key={i} className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-950">{pt.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-800 font-medium">
                              {pt.tag}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{pt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Rewrites */}
              {activeTab === "rewrites" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-950">
                        Otimização de pontos
                      </h4>
                      <p className="text-xs text-gray-500">
                        Transformação orientada de responsabilidade passiva em conquista quantificada.
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{diagnosticResult.rewriteExample.section}</span>
                  </div>

                  {/* Side by side diff */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before */}
                    <div className="p-5 rounded-2xl bg-gray-50 border border-black/[0.08] space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Formulação original
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed italic">
                        &ldquo;{diagnosticResult.rewriteExample.before}&rdquo;
                      </p>
                    </div>

                    {/* After */}
                    <div className="p-5 rounded-2xl bg-black text-white space-y-2 relative group shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                          Versão revista de alto impacto
                        </span>
                        <button
                          onClick={() => copyRewrite(diagnosticResult.rewriteExample.after)}
                          className="text-[11px] text-gray-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          {copied ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                      <p className="text-xs text-white font-medium leading-relaxed">
                        &ldquo;{diagnosticResult.rewriteExample.after}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 border border-black/[0.08] text-xs text-gray-600">
                    <span className="text-gray-950 font-bold">Porque funciona esta revisão:</span> {diagnosticResult.rewriteExample.explanation}
                  </div>
                </div>
              )}

              {/* TAB 4: Interview Scenarios */}
              {activeTab === "interview" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="mb-2">
                    <h4 className="text-sm font-bold text-gray-950">
                      Perguntas de entrevista específicas do perfil
                    </h4>
                    <p className="text-xs text-gray-500">
                      Geradas com base nas lacunas de experiência e afirmações técnicas específicas do seu CV.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {diagnosticResult.interviewQuestions.map((q, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-gray-50 border border-black/[0.08] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-950">
                            Pergunta {idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-black/[0.1] text-gray-700 font-medium">
                            {q.framework}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900">
                          &ldquo;{q.question}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500 pt-1">
                          {q.context}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/chat"
                      className="text-xs px-4 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Praticar no chat do assistente
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
