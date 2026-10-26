// The site in English for visitors outside the Portuguese-speaking countries.
// The pages are written in Portuguese. When the language is English, every piece of text the page shows
// (and everything the scripts add later) is looked up here and swapped for its English version.
// Which language: the visitor's own choice (the switch in the footer) wins; otherwise the country their
// connection comes from, as /api/tempo reports it: Portuguese in PT, BR, AO, MZ, CV, GW, ST, TL, MO and GQ,
// English everywhere else. The small script at the top of each page has already applied a saved choice.

const root = document.documentElement;
export const lang = root.lang.startsWith("en") ? "en" : "pt";
const CHOICE = "cvviews:lang";
const AUTO = "cvviews:auto-lang";
const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* private window: decided again next visit */ } };

// First visit, nothing saved yet: ask where the visit comes from, and switch if it's the other language.
const deciding = !read(CHOICE) && !read(AUTO);
if (deciding) {
  fetch("/api/tempo?so=lugar")
    .then((r) => (r.ok ? r.json() : null))
    .then((place) => {
      const want = place?.lang === "en" ? "en" : "pt";
      write(AUTO, want);
      if (want !== lang) location.reload();
      else root.classList.remove("i18n-wait");
    })
    .catch(() => root.classList.remove("i18n-wait"));
}

export function setLanguage(next) {
  write(CHOICE, next);
  location.reload();
}

/* ---------------- The words ---------------- */
const EN = {
  // pages and navigation
  "CVviews | Revisão de CV em português": "CVviews | CV review",
  "Cola ou anexa o teu CV e vê o que um recrutador vai achar dele, com as frases que deves mudar. Também dá para treinar a entrevista.": "Paste or attach your CV and see what a recruiter will think of it, with the lines you should change. You can practise your interview too.",
  "Saltar para a revisão do CV": "Skip to the CV review",
  "Saltar para o conteúdo": "Skip to content",
  "CVviews, página inicial": "CVviews, home page",
  "Principal": "Main",
  "Site": "Site",
  "Como funciona": "How it works",
  "Entrevistas": "Interviews",
  "Preços": "Pricing",
  "Perguntas": "Questions",
  "Entrar": "Sign in",
  "Rever o meu CV": "Review my CV",
  "Menu": "Menu",
  "Fechar": "Close",
  "ou criar uma conta": "or create an account",
  "Experimentar": "Try it",
  "A revisão de um CV inventado": "The review of a made-up CV",
  "A minha conta": "My account",
  "Explorar": "Explore",
  "Experimenta com um exemplo": "Try it with an example",
  "Designer de produto": "Product designer",
  "Engenheiro de backend": "Backend engineer",
  "Recém-licenciada": "Recent graduate",
  "Começa já, sem conta": "Start now, no account needed",
  "Treinar a entrevista": "Practise the interview",
  "Perguntas feitas a partir do teu CV": "Questions made from your CV",
  "CVviews ©2026": "CVviews ©2026",
  "Privacidade": "Privacy",
  "Cookies": "Cookies",
  "Termos": "Terms",
  "O CVviews lê o teu CV como um recrutador e": "CVviews reads your CV like a recruiter and",
  "diz-te": "tells you",
  "o que mudar primeiro.": "what to change first.",

  // the composer
  "Revisão do CV": "CV review",
  "O que é que um recrutador vai achar do teu CV?": "What will a recruiter think of your CV?",
  "Cola-o aqui ou anexa o ficheiro. Em menos de um minuto tens uma opinião sincera e as frases que deves mudar.": "Paste it here or attach the file. In under a minute you get an honest opinion and the lines you should change.",
  "As mensagens com o Leo não ficam guardadas.": "Your messages with Leo aren't saved.",
  "Recomeçar": "Start over",
  "Passar a Pro": "Go Pro",
  "O teu CV": "Your CV",
  "Tipo de perguntas": "Type of questions",
  "Uma mistura de perguntas": "A mix of questions",
  "Comportamentais": "Behavioural",
  "Técnicas": "Technical",
  "Sobre o meu CV": "About my CV",
  "Entrevistador": "Interviewer",
  "Entrevistador simpático": "Friendly interviewer",
  "Entrevistador justo": "Fair interviewer",
  "Entrevistador exigente": "Tough interviewer",
  "Número de perguntas": "Number of questions",
  "5 perguntas": "5 questions",
  "8 perguntas": "8 questions",
  "12 perguntas": "12 questions",
  "O que queres fazer?": "What do you want to do?",
  "Rever": "Review",
  "Perguntar": "Ask",
  "ao Leo": "Leo",
  "Entrevista": "Interview",
  "Anexar o teu CV": "Attach your CV",
  "Cola aqui o teu CV, ou anexa um PDF, Word ou fotografias": "Paste your CV here, or attach a PDF, Word file or photos",
  "A que vaga te estás a candidatar? (opcional)": "Which role are you applying for? (optional)",
  "Para que vaga? (opcional)": "Which role? (optional)",
  "Escreve ao Leo o que quiseres, ou junta uma imagem": "Write to Leo about anything, or add an image",
  "Escreve ao Leo o que quiseres": "Write to Leo about anything",
  "Escreve ao Leo": "Write to Leo",
  "Para que vaga é a entrevista? Escreve o cargo ou cola o anúncio": "Which role is the interview for? Type the job title or paste the ad",
  "Para que vaga é a entrevista?": "Which role is the interview for?",
  "Enviar ao Leo": "Send to Leo",
  "Criar as perguntas": "Create the questions",
  "O teu CV, ou a vaga a que te candidatas": "Your CV, or the role you're applying for",
  "Mensagem para o Leo": "Message for Leo",
  "A vaga para a entrevista": "The role for the interview",
  "Larga aqui o teu CV": "Drop your CV here",
  "PDF, Word, texto ou fotografias": "PDF, Word, text or photos",
  "Fechar aviso": "Close notice",
  "Podes perguntar": "You could ask",
  "Vai com a próxima mensagem": "Goes with your next message",
  "Exemplo inventado para experimentar": "A made-up example to try",
  "A ler a fotografia…": "Reading the photo…",
  "A abrir o documento…": "Opening the document…",
  "CV colado": "Pasted CV",
  "Remover": "Remove",
  "Parar": "Stop",

  // plan meter
  "Plano grátis": "Free plan",
  "Limites do plano": "Plan limits",
  "Limites do plano ·": "Plan limits ·",
  "Grátis": "Free",
  "Ver planos": "See plans",
  "Os limites voltam ao zero todos os dias.": "Limits reset every day.",
  "Ver os limites do plano": "See the plan's limits",
  "Revisões do CV": "CV reviews",
  "CV corrigido": "Corrected CV",
  "Mensagens ao Leo": "Messages to Leo",

  // film and the Leo / interview section
  "Como funciona o CVviews": "How CVviews works",
  "Vídeo de introdução do CVviews: anexas o CV, recebes a revisão desenhada no próprio CV, falas com o Leo e treinas a entrevista": "CVviews intro video: you attach your CV, get the review drawn on the CV itself, talk to Leo and practise your interview",
  "Pausar": "Pause",
  "Ver": "Play",
  "E depois podes falar sobre ele": "And then you can talk about it",
  "A revisão é só o começo. Com o CV já lido, tens alguém para tirar dúvidas e para te pôr à prova antes da entrevista a sério.": "The review is just the start. With your CV already read, you have someone to answer questions and put you to the test before the real interview.",
  "Conversa": "Chat",
  "Pergunta ao Leo": "Ask Leo",
  "O Leo leu o teu CV, por isso as respostas são sobre ti e não conselhos gerais. Pergunta o que te custa explicar: um ano parado, uma mudança de área, um cargo curto.": "Leo has read your CV, so the answers are about you, not general advice. Ask about what's hard to explain: a year out, a change of field, a short job.",
  "Perguntar ao Leo": "Ask Leo",
  "leu o teu CV": "has read your CV",
  "Como explico o ano em que parei?": "How do I explain the year I took off?",
  "Uma linha honesta, e segues em frente. Algo como:": "One honest line, then move on. Something like:",
  "2019 a 2020: viagens e trabalho como freelancer, a fazer sites para dois clientes locais.": "2019 to 2020: travel and freelance work, building websites for two local clients.",
  "O emprego seguinte faz o resto.": "Your next job does the rest.",
  "Treina a entrevista": "Practise the interview",
  "As perguntas saem do que está no teu CV, como faria um recrutador. Escreves a resposta e recebes uma nota, o que funcionou e o que dizer melhor.": "The questions come from what's on your CV, the way a recruiter would ask them. You write your answer and get a score, what worked and what to say better.",
  "Começar a treinar": "Start practising",
  "Pergunta 1 de 5": "Question 1 of 5",
  "tirada do teu CV": "taken from your CV",
  "Fala-me do redesenho do registo na Lumena Saúde. Como soubeste que tinha resultado?": "Tell me about the sign-up redesign at Lumena Health. How did you know it had worked?",
  "“Os médicos gostaram e": "“The doctors liked it and",
  "ficou muito melhor": "it got much better",
  "as marcações falhadas caíram para metade": "missed appointments fell by half",
  "Boa história. Agora diz o que mudou, com um número.": "Good story. Now say what changed, with a number.",
  "Nota: 6 em 10": "Score: 6 out of 10",

  // pricing
  "Começas de graça. Quando andares mesmo à procura de emprego, o Pro dá-te seis vezes mais por dia.": "You start for free. When you're really job hunting, Pro gives you six times more a day.",
  "Comparação dos planos Grátis e Pro": "Comparison of the Free and Pro plans",
  "Os dois planos usam a mesma revisão. O Pro dá-te muito mais por dia e junta o que ajuda na reta final.": "Both plans use the same review. Pro gives you much more a day and adds what helps in the final stretch.",
  "Para experimentar e corrigir o essencial.": "To try it and fix the essentials.",
  "Começar": "Get started",
  "Não precisas de conta.": "No account needed.",
  "Pro": "Pro",
  "por mês": "per month",
  "Para quem anda à procura e quer rever à vontade.": "For when you're job hunting and want to review freely.",
  "Pagamento pela Stripe. Cancelas quando quiseres.": "Payment through Stripe. Cancel whenever you like.",
  "Revisão": "Review",
  "Leo": "Leo",
  "5 por dia": "5 a day",
  "30 por dia": "30 a day",
  "20 por dia": "20 a day",
  "200 por dia": "200 a day",
  "CV corrigido no próprio documento": "CV corrected in the document itself",
  "Mostrar imagens ao Leo": "Show images to Leo",
  "Não incluído": "Not included",
  "Incluído": "Included",
  "Perguntas tiradas do teu CV": "Questions taken from your CV",
  "Nota e dicas a cada resposta": "A score and tips for each answer",
  "4,99 € por mês": "€4.99 per month",
  "4,99 €": "€4.99",
  "0 €": "€0",

  // FAQ
  "Perguntas frequentes": "Frequently asked questions",
  "O meu CV fica guardado?": "Is my CV saved?",
  "Só se quiseres. Sem conta, fica neste separador do navegador e desaparece quando o fechas ou atualizas. Com sessão iniciada, as tuas revisões ficam guardadas na tua conta, e podes apagá-las na página da conta.": "Only if you want. Without an account, it stays in this browser tab and disappears when you close or refresh it. When you're signed in, your reviews are saved to your account, and you can delete them on the account page.",
  "Que ficheiros posso usar?": "Which files can I use?",
  "Um PDF, um ficheiro Word (.docx), texto simples ou fotografias das páginas, tiradas com o telemóvel (JPG, PNG, WebP ou HEIC do iPhone). Se o CV tiver várias páginas, anexa até 4 fotografias de uma vez. Os PDF podem ter até 3 MB e cada fotografia até 40 MB. Se o teu PDF for digitalizado, envia antes fotografias das páginas. Também podes colar o texto diretamente.": "A PDF, a Word file (.docx), plain text or photos of the pages taken with your phone (JPG, PNG, WebP or iPhone HEIC). If your CV has several pages, attach up to 4 photos at once. PDFs can be up to 3 MB and each photo up to 40 MB. If your PDF is scanned, send photos of the pages instead. You can also paste the text directly.",
  "O meu CV pode estar em inglês?": "Can my CV be in another language?",
  "Pode. A revisão vem sempre em português, mas as linhas reescritas ficam na língua do teu CV, para as poderes copiar diretamente.": "Yes. The review comes in English, but the rewritten lines stay in your CV's language, so you can copy them straight in.",
  "Preciso de uma conta?": "Do I need an account?",
  "Para o plano grátis, não. Só precisas de conta para passar ao Pro, para a subscrição ficar associada a ti.": "Not for the free plan. You only need an account to go Pro, so the subscription is linked to you.",
  "Quanto custa?": "How much does it cost?",
  "O plano grátis tem, por dia, 5 revisões, 5 CV corrigidos no próprio documento e 20 mensagens com o Leo. O Pro custa 4,99 € por mês, sobe os limites para 30 revisões, 30 CV corrigidos e 200 mensagens por dia, deixa-te mostrar imagens ao Leo e dá feedback às tuas respostas de entrevista. Cancelas quando quiseres.": "The free plan gives you, each day, 5 reviews, 5 CVs corrected in the document itself and 20 messages with Leo. Pro costs €4.99 a month, raises the limits to 30 reviews, 30 corrected CVs and 200 messages a day, lets you show images to Leo and gives feedback on your interview answers. Cancel whenever you like.",
  "Posso treinar entrevistas sem CV?": "Can I practise interviews without a CV?",
  "Sim. Escolhe Entrevista e escreve o cargo ou cola o anúncio. As perguntas passam a ser sobre a vaga em vez da tua experiência.": "Yes. Choose Interview and type the job title or paste the ad. The questions are then about the role instead of your experience.",
  "Quem escreve o feedback?": "Who writes the feedback?",
  "Um modelo de IA, com instruções para ler como um recrutador experiente e para ser honesto e concreto. Costuma ajudar, mas pode enganar-se, por isso confirma o que for importante antes de enviares o CV.": "An AI model, instructed to read like an experienced recruiter and to be honest and concrete. It usually helps, but it can get things wrong, so check anything important before you send your CV.",
  "Vai inventar coisas?": "Will it make things up?",
  "Tem instruções para nunca inventar experiência. Quando uma linha reescrita precisa de um número que só tu sabes, fica um [espaço] para o preencheres.": "It's instructed never to invent experience. When a rewritten line needs a number only you know, it leaves a [blank] for you to fill in.",

  // the review
  "Revê o meu CV": "Review my CV",
  "A ler o teu CV": "Reading your CV",
  "A comparar com a vaga": "Comparing it with the role",
  "A perceber a que vagas se adequa": "Working out which roles it fits",
  "A marcar o que funciona e o que não funciona": "Marking what works and what doesn't",
  "A escrever novas versões": "Writing new versions",
  "No geral, dava-lhe": "Overall, I'd give it",
  ", o que é excelente.": ", which is excellent.",
  ", acima da média. A partir de 85 é excelente.": ", above average. 85 and up is excellent.",
  ", na média. A partir de 85 é excelente.": ", about average. 85 and up is excellent.",
  ", abaixo da média. A partir de 85 é excelente.": ", below average. 85 and up is excellent.",
  "O que corrigir": "What to fix",
  "corrigir primeiro": "fix first",
  "vale a pena corrigir": "worth fixing",
  "pormenor": "detail",
  "O que fazer:": "What to do:",
  "Linhas a reescrever": "Lines to rewrite",
  "Copiar a nova linha": "Copy the new line",
  "O que está a resultar": "What's working",
  "Nota por área": "Score by area",
  "Palavras-chave": "Keywords",
  "Palavras que um recrutador, ou o software dele, pode procurar e que não estão no teu CV:": "Words a recruiter, or their software, may look for that aren't on your CV:",
  "Não falta nenhuma palavra-chave evidente para este tipo de vaga.": "No obvious keyword is missing for this kind of role.",
  "Por onde eu começava": "Where I'd start",
  "O teu CV, corrigido": "Your CV, corrected",
  "O que anexaste, com esta revisão por cima:": "What you attached, with this review on top:",
  "a riscar": "crossed out",
  "a escrever no lugar": "written in its place",
  "a manter": "to keep",
  "e": "and",
  "A preparar o teu CV": "Preparing your CV",
  "O teu CV, já corrigido": "Your CV, already corrected",
  "Tudo aplicado, pronto a usar. Onde vires um": "Everything applied, ready to use. Where you see a",
  ", põe o teu número.": ", put in your own number.",
  "A escrever o teu CV corrigido": "Writing your corrected CV",
  "Copiar a revisão": "Copy the review",
  "Perguntar sobre isto": "Ask about this",
  "Copiado": "Copied",
  "Não foi possível copiar. Seleciona o texto": "Couldn't copy. Select the text",
  "O teu CV, marcado com esta revisão": "Your CV, marked up with this review",
  "Copiar o CV já corrigido": "Copy the corrected CV",
  "Copiar o texto já corrigido": "Copy the corrected text",
  "Descarregar esta versão": "Download this version",
  "Descarregar o CV corrigido": "Download the corrected CV",
  "Descarregar em PDF": "Download as PDF",
  "A preparar o PDF…": "Preparing the PDF…",
  "Copiar o texto": "Copy the text",
  "Não foi possível desenhar as correções neste ficheiro.": "Couldn't draw the corrections on this file.",
  "Não foi possível criar o PDF. Abre-se a janela de impressão para o guardares.": "Couldn't create the PDF. The print window will open so you can save it.",
  "Isto não parece um CV.": "This doesn't look like a CV.",
  "Anexa um CV em PDF, Word ou fotografia, ou cola o texto.": "Attach a CV as a PDF, Word file or photo, or paste the text.",
  "Anexar outro ficheiro": "Attach another file",
  "Esse ficheiro não parece um CV.": "That file doesn't look like a CV.",
  "Guardada na tua conta.": "Saved to your account.",
  "Ver as tuas revisões": "See your reviews",
  "Revisão guardada": "Saved review",
  "Ver o Pro": "See Pro",
  "O que devo corrigir primeiro?": "What should I fix first?",
  "Reescreve o meu resumo de perfil": "Rewrite my profile summary",
  "Faz-me uma entrevista para esta vaga": "Interview me for this role",
  "Algo correu mal.": "Something went wrong.",
  "Tentar de novo": "Try again",

  // Leo
  "O Leo está a pensar": "Leo is thinking",
  "Destas perguntas de entrevista, qual devo preparar mais, e porquê?": "Of these interview questions, which should I prepare most, and why?",
  "Como estruturo uma resposta com o método STAR? Usa um exemplo do meu CV.": "How do I structure an answer with the STAR method? Use an example from my CV.",
  "Hum, não percebi bem. Podes perguntar de outra forma?": "Hmm, I didn't quite get that. Could you ask another way?",

  // interview
  "A ler a vaga": "Reading the role",
  "A escrever as perguntas": "Writing the questions",
  "A juntar dicas para cada uma": "Adding tips for each one",
  "Anexa o teu CV e as perguntas passam a ser sobre a tua experiência.": "Attach your CV and the questions will be about your experience.",
  "Porque perguntam:": "Why they ask:",
  "Do teu CV:": "From your CV:",
  "Treina a tua resposta": "Practise your answer",
  "Escreve-a como a dirias em voz alta": "Write it the way you'd say it out loud",
  "Recebes uma nota, dicas e uma versão mais forte.": "You get a score, tips and a stronger version.",
  "Pedir feedback": "Get feedback",
  "A ler a tua resposta…": "Reading your answer…",
  "O que resultou": "What worked",
  "Para ficar mais forte": "To make it stronger",
  "Uma versão mais forte": "A stronger version",
  "Escreve um pouco mais antes de pedir feedback.": "Write a little more before asking for feedback.",
  "Que pergunta devo preparar mais?": "Which question should I prepare most?",
  "Como estruturo uma resposta STAR?": "How do I structure a STAR answer?",
  "Diz-me a vaga, ou anexa primeiro o teu CV.": "Tell me the role, or attach your CV first.",

  // composer notes and file errors
  "Só um momento, ainda estamos a ler o teu ficheiro.": "One moment, we're still reading your file.",
  "Não foi possível falar com o servidor. Verifica a ligação e tenta de novo.": "Couldn't reach the server. Check your connection and try again.",
  "Mostrar imagens ao Leo é do plano Pro. Vê os planos mais abaixo na página.": "Showing images to Leo is part of the Pro plan. See the plans further down the page.",
  "Essa imagem tem mais de 40 MB. Experimenta uma mais pequena.": "That image is over 40 MB. Try a smaller one.",
  "Para juntar vários ficheiros, usa só fotografias do CV, uma por página.": "To add several files, use only photos of your CV, one per page.",
  "Esse PDF tem mais de 3 MB. Se for digitalizado, envia antes fotografias das páginas.": "That PDF is over 3 MB. If it's scanned, send photos of the pages instead.",
  "Não foi possível ler esse ficheiro.": "Couldn't read that file.",
  "Não foi possível abrir o leitor de Word. Experimenta um PDF.": "Couldn't open the Word reader. Try a PDF.",
  "Esse tipo de ficheiro não funciona. Usa um PDF, um Word, um ficheiro de texto ou fotografias.": "That kind of file doesn't work. Use a PDF, a Word file, a text file or photos.",
  "Não foi possível abrir essa fotografia do iPhone. Experimenta uma captura de ecrã.": "Couldn't open that iPhone photo. Try a screenshot.",
  "Não foi possível abrir essa imagem. Experimenta um JPG, um PNG ou uma captura de ecrã.": "Couldn't open that image. Try a JPG, a PNG or a screenshot.",
  "Não foi possível abrir a fotografia.": "Couldn't open the photo.",
  "Entra na tua conta para veres as tuas revisões.": "Sign in to see your reviews.",
  "Essa revisão já não existe.": "That review no longer exists.",
  "Não foi possível abrir essa revisão.": "Couldn't open that review.",
  "Bem-vindo ao Pro. Pode demorar um minuto até tudo ficar desbloqueado.": "Welcome to Pro. It may take a minute for everything to unlock.",

  // server messages
  "Algo correu mal. Tenta de novo.": "Something went wrong. Try again.",
  "Estamos com muitos pedidos neste momento. Tenta de novo daqui a um minuto.": "We're getting a lot of requests right now. Try again in a minute.",
  "Não foi possível tratar esse pedido. Experimenta um CV em PDF (até 3 MB), Word, texto ou fotografias.": "Couldn't handle that request. Try a CV as a PDF (up to 3 MB), Word file, text or photos.",
  "Não chegou nenhum CV.": "No CV arrived.",
  "O PDF estava vazio.": "The PDF was empty.",
  "Não foi possível ler texto desse PDF. Se for digitalizado, envia antes uma fotografia ou uma captura de ecrã.": "Couldn't read any text in that PDF. If it's scanned, send a photo or a screenshot instead.",
  "Esse CV parece curto demais para rever. Cola o texto completo ou anexa um ficheiro.": "That CV looks too short to review. Paste the full text or attach a file.",
  "Envia uma fotografia JPG, PNG ou WebP.": "Send a JPG, PNG or WebP photo.",
  "Não conseguimos ler texto nessa fotografia. Tira uma mais nítida e bem iluminada, com a página inteira.": "We couldn't read any text in that photo. Take a sharper, well-lit one showing the whole page.",
  "Anexa um CV ou descreve primeiro a vaga.": "Attach a CV or describe the role first.",
  "A resposta ficou cortada. Experimenta um CV mais curto ou menos perguntas.": "The answer got cut off. Try a shorter CV or fewer questions.",
  "A IA não conseguiu ajudar com este pedido. Experimenta outro CV ou outras palavras.": "The AI couldn't help with this request. Try another CV or different words.",
  "Já fizeste as 5 revisões grátis de hoje. Amanhã há mais, ou passa ao Pro para teres muito mais por dia.": "You've used today's 5 free reviews. There are more tomorrow, or go Pro for many more a day.",
  "Já trocaste as 20 mensagens grátis de hoje com o Leo. Amanhã há mais, ou passa ao Pro para teres muito mais por dia.": "You've used today's 20 free messages with Leo. There are more tomorrow, or go Pro for many more a day.",
  "Já usaste as 5 correções no documento grátis de hoje. Amanhã há mais, ou passa ao Pro para teres muito mais por dia.": "You've used today's 5 free in-document corrections. There are more tomorrow, or go Pro for many more a day.",
  "Mostrar imagens ao Leo é do plano Pro.": "Showing images to Leo is part of the Pro plan.",
  "O feedback às tuas respostas de entrevista é do plano Pro.": "Feedback on your interview answers is part of the Pro plan.",
  "Chegaste às 30 revisões de hoje, o limite diário do Pro. Amanhã há mais.": "You've reached today's 30 reviews, Pro's daily limit. There are more tomorrow.",
  "Chegaste aos 30 CV corrigidos de hoje, o limite diário do Pro. Amanhã há mais.": "You've reached today's 30 corrected CVs, Pro's daily limit. There are more tomorrow.",
  "Chegaste às 200 mensagens de hoje com o Leo, o limite diário do Pro. Amanhã há mais.": "You've reached today's 200 messages with Leo, Pro's daily limit. There are more tomorrow.",
  "Os pagamentos ainda não estão ligados.": "Payments aren't switched on yet.",
  "Entra na tua conta primeiro.": "Sign in first.",
  "Já tens o Pro.": "You already have Pro.",
  "Ainda não tens nenhuma subscrição.": "You don't have a subscription yet.",
  "Os pagamentos não responderam. Tenta de novo daqui a pouco.": "Payments didn't respond. Try again shortly.",
  "Pedido inválido.": "Invalid request.",

  // cookie notice
  "Só contamos visitas": "We only count visits",
  "Saber mais": "Learn more",
  "Com a tua autorização, contamos as visitas para perceber que páginas ajudam. Nada de anúncios.": "With your permission, we count visits to see which pages help. No ads.",
  "Recusar": "Decline",
  "Aceitar": "Accept",

  // 404
  "Página não encontrada | CVviews": "Page not found | CVviews",
  "Esta página não existe": "This page doesn't exist",
  "Esta página não existe.": "This page doesn't exist.",
  "Talvez o endereço tenha um erro, ou a página tenha mudado de sítio.": "The address may have a typo, or the page may have moved.",
  "Voltar ao início": "Back to the start",

  // sign-in and account
  "Entrar | CVviews": "Sign in | CVviews",
  "Entra no CVviews ou cria uma conta.": "Sign in to CVviews or create an account.",
  "Olá de novo": "Welcome back",
  "Entra no CVviews.": "Sign in to CVviews.",
  "Continuar com o Google": "Continue with Google",
  "ou": "or",
  "Email": "Email",
  "Continuar com email": "Continue with email",
  "Mudar": "Change",
  "Palavra-passe": "Password",
  "Esqueceste-te?": "Forgot it?",
  "O Caps Lock está ligado": "Caps Lock is on",
  "O teu nome": "Your name",
  "Cria uma palavra-passe": "Create a password",
  "Pelo menos 8 caracteres": "At least 8 characters",
  "Um número ou um símbolo": "A number or a symbol",
  "Diferente do teu email": "Different from your email",
  "Criar conta": "Create account",
  "Ao criares conta, aceitas os": "By creating an account, you accept the",
  "e a": "and the",
  "Política de privacidade": "Privacy policy",
  "Envia-me uma ligação": "Send me a link",
  "Voltar a entrar": "Back to sign in",
  "Nova palavra-passe": "New password",
  "Guardar a nova palavra-passe": "Save the new password",
  "Ir para o CVviews": "Go to CVviews",
  "Enviar o email outra vez": "Send the email again",
  "Usar outro email": "Use another email",
  "Entras com": "You sign in with",
  "Conta criada": "Account created",
  "Último acesso": "Last sign-in",
  "Plano": "Plan",
  "Os teus CVs": "Your CVs",
  "Ainda não reviste nenhum CV": "You haven't reviewed a CV yet",
  "Cada CV que revês com a sessão iniciada fica guardado aqui, para voltares a ele quando quiseres.": "Every CV you review while signed in is saved here, so you can come back to it whenever you like.",
  "Rever um CV": "Review a CV",
  "Mudar a palavra-passe": "Change password",
  "Sair": "Sign out",
  "Apagar a conta": "Delete account",
  "Isto apaga a tua conta e o teu perfil, para sempre. As revisões, o Leo e o treino de entrevistas continuam a funcionar sem conta.": "This deletes your account and your profile, for good. Reviews, Leo and interview practice keep working without an account.",
  "Apagar para sempre": "Delete for good",
  "Cancelar": "Cancel",
  "Continuar sem conta": "Continue without an account",
  "Experimentar de outra forma": "Try another way",
  "tu@exemplo.pt": "you@example.com",
  "Mostrar a palavra-passe": "Show password",
  "Esconder a palavra-passe": "Hide password",
  "Os dados da tua conta": "Your account details",
  "Ainda não tens conta?": "Don't have an account?",
  "Já tens conta?": "Already have an account?",
  "Cria a tua conta": "Create your account",
  "Demora um minuto.": "It takes a minute.",
  "Recuperar a palavra-passe": "Recover your password",
  "Escreve o email com que criaste a conta e enviamos-te uma ligação para escolheres uma nova.": "Type the email you signed up with and we'll send you a link to choose a new one.",
  "Escolhe uma nova palavra-passe": "Choose a new password",
  "Usa uma que não uses em mais lado nenhum.": "Use one you don't use anywhere else.",
  "Vê o teu email": "Check your email",
  "Tens sessão iniciada neste navegador.": "You're signed in on this browser.",
  "A tua conta": "Your account",
  "As contas ainda não abriram": "Accounts aren't open yet",
  "Ainda não é possível entrar nem criar conta. Nada do que escreveste aqui foi guardado.": "You can't sign in or create an account yet. Nothing you typed here was saved.",
  "Não conseguimos ligar às contas": "We couldn't reach accounts",
  "O serviço de contas não respondeu, por isso nada do que escreveste foi enviado. Verifica a ligação à internet e tenta de novo.": "The accounts service didn't respond, so nothing you typed was sent. Check your internet connection and try again.",
  "O email ou a palavra-passe não estão certos.": "The email or password isn't right.",
  "Isso não parece um email. Vê se há algum erro, como em nome@exemplo.pt.": "That doesn't look like an email. Check for a typo, as in name@example.com.",
  "Escreve a tua palavra-passe.": "Type your password.",
  "Já existe uma conta com este email. Escreve a palavra-passe para entrares.": "There's already an account with this email. Type the password to sign in.",
  "Essa palavra-passe é fácil de adivinhar. Escolhe outra mais longa.": "That password is easy to guess. Choose a longer one.",
  "Foram muitas tentativas seguidas. Espera um bocado e tenta de novo.": "Too many attempts in a row. Wait a little and try again.",
  "Sem ligação à internet. Verifica a rede e tenta de novo.": "No internet connection. Check your network and try again.",
  "O navegador bloqueou a janela da Google. Deixa este site abrir janelas e tenta de novo.": "Your browser blocked the Google window. Let this site open windows and try again.",
  "Este endereço ainda não está autorizado a entrar com a Google.": "This address isn't authorised to sign in with Google yet.",
  "Esta ligação já expirou. Pede uma nova.": "This link has expired. Ask for a new one.",
  "Esta ligação já foi usada ou está incompleta. Pede uma nova.": "This link has already been used or is incomplete. Ask for a new one.",
  "Por segurança, entra outra vez e tenta de novo.": "For security, sign in again and try again.",
  "Já tens conta com este email. Entra com o email e a palavra-passe.": "You already have an account with this email. Sign in with your email and password.",
  "Entra na tua conta para pedires outro email.": "Sign in to ask for another email.",
  "Entrar com o Google ainda não está ligado. Usa o teu email.": "Signing in with Google isn't switched on yet. Use your email.",
  "Escreve o teu email para continuar.": "Type your email to continue.",
  "Enviado. Vê a tua caixa de entrada": "Sent. Check your inbox",
  "Escreve o email com que criaste a conta.": "Type the email you signed up with.",
  "Reenviar a confirmação": "Resend the confirmation",
  "os 50 mais recentes": "the 50 most recent",
  "Apagar esta revisão": "Delete this review",
  "Não foi possível carregar os teus CVs": "Couldn't load your CVs",
  "Tenta de novo daqui a pouco. Se continuar, avisa-nos.": "Try again shortly. If it keeps happening, let us know.",
  "Gerir a subscrição": "Manage subscription",
  "Ligação enviada, vê o teu email": "Link sent, check your email",
  "Terminaste a sessão.": "You've signed out.",
  "Por segurança, sai, entra outra vez e depois apaga a conta.": "For security, sign out, sign in again and then delete the account.",
  "O teu email está confirmado.": "Your email is confirmed.",
  "Confirmado": "Confirmed",
  "Por confirmar": "Not confirmed",
  "Email e palavra-passe": "Email and password",
  "Google, e email e palavra-passe": "Google, and email and password",
  "Google": "Google",
  "Ontem": "Yesterday",
  "Fotografia": "Photo",
  "Imagem enviada": "Image sent",
  "Páginas legais": "Legal pages",
  "Privacidade | CVviews": "Privacy | CVviews",
  "Termos | CVviews": "Terms | CVviews",
  "Cookies | CVviews": "Cookies | CVviews",
  "Política de privacidade | CVviews": "Privacy policy | CVviews",
  "Termos de utilização | CVviews": "Terms of use | CVviews",
  "Política de cookies | CVviews": "Cookie policy | CVviews",
};

// Text that is put together from pieces: matched by pattern instead of word for word.
const MONTHS = { janeiro: "January", fevereiro: "February", março: "March", abril: "April", maio: "May", junho: "June", julho: "July", agosto: "August", setembro: "September", outubro: "October", novembro: "November", dezembro: "December" };
const WEEKDAYS = { "segunda-feira": "Monday", "terça-feira": "Tuesday", "quarta-feira": "Wednesday", "quinta-feira": "Thursday", "sexta-feira": "Friday", "sábado": "Saturday", "domingo": "Sunday" };
const date = (s) => s.replace(/(\d{1,2}) de (\p{L}+)(?: de (\d{4}))?/gu, (m, d, mo, y) => (MONTHS[mo] ? `${d} ${MONTHS[mo]}${y ? ` ${y}` : ""}` : m));
const LIMIT_EN = { "revisões": "reviews", "as revisões": "reviews", "CV corrigidos": "corrected CVs", "os CV corrigidos": "corrected CVs", "mensagens ao Leo": "messages to Leo", "as mensagens ao Leo": "messages to Leo" };
const RULES = [
  [/^(\d+) em 100$/, (_, n) => `${n} out of 100`],
  [/^Como corrijo “(.+)”\?$/s, (_, x) => `How do I fix “${x}”?`],
  [/^(\d+) em 10\.$/, (_, n) => `${n} out of 10.`],
  [/^Grátis · (\d+) de (\d+) revisões hoje$/, (_, a, b) => `Free · ${a} of ${b} reviews today`],
  [/^Repõe em (.+)$/, (_, t) => `Resets in ${t.replace(/ h /, " h ").replace(/ dias$/, " days")}`],
  [/^Repõe às (\d\d:\d\d)$/, (_, t) => `Resets at ${t}`],
  [/^Repõe (\p{L}+-?\p{L}*) às (\d\d:\d\d)$/u, (_, d, t) => `Resets ${WEEKDAYS[d] || d} at ${t}`],
  [/^Quase no limite de (.+)$/, (_, k) => `Nearly at your limit of ${LIMIT_EN[k] || k}`],
  [/^Acabaram (.+) de hoje$/, (_, k) => `No ${LIMIT_EN[k] || k} left today`],
  [/^Revisto a (.+) · (\d+) em 100$/, (_, d, n) => `Reviewed on ${date(d)} · ${n} out of 100`],
  [/^Revisto a (.+)$/, (_, d) => `Reviewed on ${date(d)}`],
  [/^(.+) · (\d+) em 100$/, (_, d, n) => `${date(d)} · ${n} out of 100`],
  [/^Revê o meu CV para (.+)$/s, (_, r) => `Review my CV for ${r}`],
  [/^Revisão pronta\. O teu CV tem (\d+) em 100\.$/, (_, n) => `Review ready. Your CV scores ${n} out of 100.`],
  [/^Faz-me uma entrevista (para (.+)|sobre o meu CV)\. (\d+) perguntas, (.+), entrevistador (.+)\.$/s, (_, w, role, n, style, level) => `Interview me ${role ? `for ${role}` : "about my CV"}. ${n} questions, ${{ "uma mistura": "a mix", "comportamentais": "behavioural", "técnicas": "technical", "sobre o meu CV": "about my CV" }[style] || style}, ${{ "simpático": "friendly", "justo": "fair", "exigente": "tough" }[level] || level} interviewer.`],
  [/^(.*?)\s*Os sistemas de triagem automática \(ATS\) (devem lê-lo bem|podem perder partes dele|podem ter dificuldade em lê-lo) \((\d+) em 100\)\.$/s, (_, pre, v, n) => `${pre ? `${t(pre)} ` : ""}Applicant tracking systems (ATS) ${{ "devem lê-lo bem": "should read it well", "podem perder partes dele": "may miss parts of it", "podem ter dificuldade em lê-lo": "may struggle to read it" }[v]} (${n} out of 100).`],
  [/^PDF, (\d+) KB$/, (_, n) => `PDF, ${n} KB`],
  [/^Documento Word, (\d+) palavras$/, (_, n) => `Word document, ${n} words`],
  [/^Texto colado, (\d+) palavras$/, (_, n) => `Pasted text, ${n} words`],
  [/^Texto, (\d+) palavras$/, (_, n) => `Text, ${n} words`],
  [/^(Lidas|Fotografia, lida) como (\d+) palavras$/, (_, w, n) => `${w === "Lidas" ? "Read" : "Photo, read"} as ${n} words`],
  [/^A ler a fotografia (\d+) de (\d+)…$/, (_, a, b) => `Reading photo ${a} of ${b}…`],
  [/^Junta no máximo (\d+) fotografias, uma por página\.$/, (_, n) => `Add at most ${n} photos, one per page.`],
  [/^Podes juntar até (\d+) imagens por mensagem\.$/, (_, n) => `You can add up to ${n} images per message.`],
  [/^Descarregar a página (\d+)$/, (_, n) => `Download page ${n}`],
  [/^Página (\d+) do teu CV, (.+)$/, (_, n, r) => `Page ${n} of your CV, ${r === "já corrigido" ? "already corrected" : "with the corrections drawn on top"}`],
  [/^O teu CV, com as correções desenhadas por cima$/, () => "Your CV, with the corrections drawn on top"],
  [/^Algo correu mal \((\d+)\)\. Tenta de novo\.$/, (_, n) => `Something went wrong (${n}). Try again.`],
  [/^Não foi possível escrever o CV corrigido agora\.(.*)$/s, (_, r) => `Couldn't write the corrected CV right now.${r}`],
  [/^Olá, (.+)\. O teu plano e as revisões$/, (_, n) => `Hi ${n}. Your plan and reviews`],
  [/^Hoje, às (.+)$/, (_, t) => `Today at ${t}`],
  [/^Pro, (termina|renova) a (.+)$/, (_, v, d) => `Pro, ${v === "termina" ? "ends" : "renews"} on ${date(d)}`],
  [/^Passar a Pro, (.+)$/, (_, p) => `Go Pro, ${p.replace("4,99 € por mês", "€4.99 per month")}`],
  [/^Abrir a revisão de (.+), (\d+) em 100, (.*)$/, (_, n, s, d) => `Open the review of ${n}, ${s} out of 100, ${date(d)}`],
  [/^Apagar a revisão de (.+)$/, (_, n) => `Delete the review of ${n}`],
  [/^(\d{1,2} de \p{L}+(?: de \d{4})?)$/u, (_, d) => date(d)],
  [/^Se houver uma conta com (.+), enviámos-lhe uma ligação para escolheres uma nova palavra-passe\. Só funciona uma vez, e durante pouco tempo\.$/, (_, e) => `If there's an account with ${e}, we've sent it a link to choose a new password. It only works once, and only for a short while.`],
  [/^Enviámos um email para (.+) com uma ligação para escolheres a nova palavra-passe\.$/, (_, e) => `We've sent an email to ${e} with a link to choose your new password.`],
  [/^O email da tua conta voltou a ser (.+)\. Se não foste tu a mudá-lo, muda também a palavra-passe\.$/, (_, e) => `Your account email is back to ${e}. If you didn't change it, change your password too.`],
  [/^(.+) As revisões, o Leo e o treino de entrevistas funcionam todos sem conta\.$/s, (_, a) => `${EN[a] || a} Reviews, Leo and interview practice all work without an account.`],
];

const norm = (s) => s.replace(/\s+/g, " ").trim();
export function t(s) {
  if (lang !== "en" || typeof s !== "string") return s;
  const k = norm(s);
  if (!k) return s;
  if (Object.hasOwn(EN, k)) return EN[k];
  // "A ler o teu CV…": the same words with an ellipsis, while something is working
  const dots = k.match(/^(.+?)(…|\.\.\.)$/);
  if (dots && Object.hasOwn(EN, dots[1])) return EN[dots[1]] + dots[2];
  for (const [re, f] of RULES) {
    const m = k.match(re);
    if (m) return f(...m);
  }
  return s;
}

/* ---------------- Swapping the page's text ---------------- */
const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG"]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"];
const looksPortuguese = (s) => /[ãõçáéíóúâêôà]|\b(não|teu|tua|teus|tuas|dos|das|uma|tens|estás|aqui|mais|ainda)\b/i.test(s);
export const missing = new Set(); // what's still in Portuguese, for checking: window.cvviewsI18nMissing

function textNode(n) {
  const v = n.nodeValue;
  const k = norm(v);
  if (!k || !/\p{L}/u.test(k)) return;
  const out = t(k);
  if (out === k) { if (looksPortuguese(k) && k.length < 400) missing.add(k); return; }
  n.nodeValue = (v.match(/^\s*/)[0]) + out + (v.match(/\s*$/)[0]);
}
function element(el) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v) { const out = t(v); if (out !== v) el.setAttribute(a, out); }
  }
  if (el.matches("meta[name=description], meta[property^='og:']")) {
    const v = el.getAttribute("content");
    const out = v && t(v);
    if (out && out !== v) el.setAttribute("content", out);
  }
}
function inUserContent(n) {
  const el = n.nodeType === 1 ? n : n.parentElement;
  return !el || !!el.closest("[contenteditable], [data-no-i18n], .rw-text, .q-text");
}
function walk(node) {
  if (node.nodeType === 3) { if (!inUserContent(node)) textNode(node); return; }
  if (node.nodeType !== 1 || SKIP.has(node.nodeName.toUpperCase()) || inUserContent(node)) return;
  element(node);
  const tw = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (x) => (x.nodeType === 1 && (SKIP.has(x.nodeName.toUpperCase()) || x.matches("[contenteditable], [data-no-i18n]")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let x;
  while ((x = tw.nextNode())) (x.nodeType === 3 ? textNode(x) : element(x));
}

if (lang === "en") {
  document.title = t(document.title);
  // The policy pages carry their English text in a <template>; it takes the Portuguese text's place.
  const legal = document.querySelector(".legal");
  const english = document.getElementById("legal-en");
  if (legal && english) legal.replaceChildren(english.content.cloneNode(true));
  walk(document.documentElement);
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "childList") r.addedNodes.forEach(walk);
      else if (r.type === "characterData") { if (!inUserContent(r.target)) textNode(r.target); }
      else if (r.type === "attributes") element(r.target);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  window.cvviewsI18nMissing = missing;
}
if (!deciding) root.classList.remove("i18n-wait");

/* ---------------- The switch in the footer ---------------- */
const spot = document.querySelector(".foot-row p:first-child, .login-foot");
if (spot) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "lang-switch";
  b.dataset.noI18n = "";
  b.textContent = lang === "en" ? "Português" : "English";
  b.lang = lang === "en" ? "pt-PT" : "en";
  b.setAttribute("aria-label", lang === "en" ? "Ver o site em português" : "View the site in English");
  b.addEventListener("click", () => setLanguage(lang === "en" ? "pt" : "en"));
  spot.append(b);
}
