# Contas do CVviews na Firebase

As contas correm na Firebase Authentication (projeto `cvviews-26241`), e cada conta tem um perfil na Cloud Firestore em `users/{uid}`.

O site já está ligado: a configuração do projeto está em `public/firebase-config.js`. Esses valores podem ser públicos, porque a Firebase protege as contas com as definições da consola e com as regras do Firestore.

O SDK da Firebase é servido pelo próprio site (`public/vendor/firebase/`), por isso ninguém recebe nada da tua visita até entrares ou criares conta.

## Já feito na consola

- Authentication ativa, com **Email/palavra-passe** e **Google**.

## Falta fazer na consola

### 1. Domínios autorizados

Authentication → Definições → **Domínios autorizados** → Adicionar domínio.

Adiciona o endereço onde o site vai estar, por exemplo `cvviews.vercel.app` ou o teu domínio. O `localhost` já lá está, por isso em testes locais funciona.

Sem isto, a entrada com o Google e as ligações nos emails não funcionam no site publicado.

### 2. Emails em português

Authentication → Modelos (Templates):

- Muda o idioma dos modelos para **português**.
- No nome do remetente, escreve `CVviews`.
- Opcional, mas recomendado: em cada modelo, "Personalizar URL de ação" → `https://O-TEU-DOMINIO/entrar`. Assim, as ligações para confirmar o email e mudar a palavra-passe abrem na página Entrar do CVviews, com o mesmo design, em vez da página genérica da Firebase. A página já sabe tratar estas ligações.

### 3. Regras do Firestore

Firestore Database → **Regras** → apaga o que lá está, cola o conteúdo do ficheiro `firestore.rules` deste projeto e carrega em **Publicar**.

As regras deixam cada pessoa ler e escrever só o seu próprio perfil, com campos e valores validados. O resto da base de dados fica fechado.

Também podes publicar pela linha de comandos, com a Firebase CLI:

```bash
firebase deploy --only firestore:rules --project cvviews-26241
```

Se ainda não criaste a base de dados, escolhe uma localização na União Europeia, por exemplo `eur3` ou `europe-west1`. Depois de criada, não dá para mudar.

### 4. Proteger a chave (recomendado)

Google Cloud Console → APIs e serviços → Credenciais → a chave do browser (Browser key).

Em "Restrições de aplicações", escolhe referenciadores HTTP e adiciona:

- `http://localhost:3007/*`
- `https://O-TEU-DOMINIO/*`
- `https://cvviews-26241.firebaseapp.com/*`

## Testar

1. Abre `http://localhost:3007/entrar?modo=registo` e cria uma conta tua.
2. No Firestore deve aparecer `users/<o teu uid>`, com o nome, o email, `provider`, `createdAt` e `lastLoginAt`.
3. Na barra de cima do site deve aparecer o teu primeiro nome em vez de "Entrar".
4. Testa também "Continuar com o Google" e "Esqueceste-te?".

## Google Analytics

Ficou desligado de propósito. Na União Europeia, o Analytics só pode ser usado depois de a pessoa aceitar um aviso de cookies, e o site promete não medir visitas. Se o quiseres ligar, é preciso primeiro um aviso de consentimento e mudar a política de cookies.

## Ainda por preencher

Os textos legais têm campos entre parênteses retos, como `[o teu nome ou o nome da empresa]`, `[morada]` e `[email de contacto]`. Têm de ser preenchidos e revistos por um advogado antes de o site abrir ao público.

## Revisões guardadas e Analytics (atualização)

- As regras em `firestore.rules` passaram a incluir `users/{uid}/reviews`, onde ficam as revisões de quem tem sessão iniciada. **Volta a colar o ficheiro todo em Firestore → Regras e carrega em Publicar.** Sem isto, as revisões não ficam guardadas.
- O Google Analytics (`G-3ST1D0TNNG`) só é carregado depois de a pessoa carregar em "Aceitar" no aviso de cookies.
- Os planos e os pagamentos estão explicados em `PAGAMENTOS.md`.
