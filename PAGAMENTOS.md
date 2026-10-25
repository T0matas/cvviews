# Planos e pagamentos

O CVviews tem dois planos:

| | Grátis | Pro, 4,99 € por mês |
|---|---|---|
| Revisões | 3 por mês | Ilimitadas |
| CV corrigido em imagem | 3 por mês | Ilimitado |
| Leo | 10 mensagens por dia, só texto | Ilimitado, com imagens |
| Entrevista | Perguntas | Perguntas e feedback a cada resposta |

Os limites estão em `lib/plan.js` (`FREE_LIMITS`). O preço mostrado está em `lib/plan.js` (`PRICE_LABEL`) e na secção de preços de `public/index.html`. O preço cobrado é o que puseres na Stripe.

Enquanto as chaves não estiverem postas, o site funciona na mesma: ninguém é cobrado, e o botão "Passar a Pro" diz que os pagamentos ainda não estão ligados.

## 1. Stripe (cobrar o Pro)

1. Cria uma conta em https://dashboard.stripe.com e começa em **modo de teste**.
2. Produtos → **Adicionar produto**: "CVviews Pro", preço recorrente **4,99 € por mês**. Copia o **ID do preço** (começa por `price_`).
3. Programadores → Chaves de API: copia a **chave secreta** (começa por `sk_test_`). É secreta: nunca a ponhas no código nem a envies a ninguém.
4. Definições → Faturação → **Portal do cliente**: carrega em Guardar. É a página onde as pessoas mudam de cartão ou cancelam.
5. Opcional: Definições → Métodos de pagamento → ativa o **MB WAY**.
6. No ficheiro `.env` (e depois na Vercel):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
```

Para testar, usa o cartão `4242 4242 4242 4242`, com qualquer data futura e qualquer CVC. Quando estiver tudo bem, repete os passos 2 e 3 em **modo real** e troca as chaves.

O CVviews não precisa de webhooks. Na checkout, a subscrição fica marcada com o ID da conta Firebase, e o servidor pergunta à Stripe se essa conta tem uma subscrição ativa. Depois de pagar, pode demorar até um minuto a ficar desbloqueado.

## 2. Firebase (contar o uso do plano grátis)

Sem isto, nada é contado e o plano grátis não tem limites.

1. Consola da Firebase → ⚙️ Definições do projeto → **Contas de serviço** → **Gerar nova chave privada**. Descarrega um ficheiro JSON. É secreto.
2. Põe o conteúdo do ficheiro numa só linha no `.env`:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"cvviews-26241",...}
```

Os contadores ficam na coleção `usage` do Firestore. Só o servidor lá escreve, porque as regras fecham tudo o resto aos browsers. Cada contador tem um código feito a partir da conta ou do IP, sem emails nem IPs guardados.

## 3. Na Vercel

Em Settings → Environment Variables, põe as mesmas variáveis: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `FIREBASE_SERVICE_ACCOUNT` e `SITE_URL` (o endereço do site, por exemplo `https://cvviews.pt`), além da `GROQ_API_KEY`.

## 4. Antes de cobrar a sério

- Preenche os campos entre `[ ]` nos Termos (secção do plano Pro), sobretudo a política de reembolsos e o direito de livre resolução, e revê-os com um advogado.
- Ativa a faturação automática da Stripe (Stripe Tax ou faturas) para emitires faturas com IVA.
