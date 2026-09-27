import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Política de privacidade | CVViews",
  description: "Saiba como o CVViews trata os dados durante a experiência de demonstração.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de privacidade"
      intro="Esta página explica, de forma transparente, o que acontece com os dados durante a utilização da versão atual do CVViews."
      sections={[
        {
          title: "A experiência atual é uma demonstração",
          paragraphs: [
            "A análise de CV apresentada nesta versão é simulada com dados de exemplo. Quando seleciona um ficheiro, a interface usa o nome e o tamanho para o apresentar no ecrã; não lê o conteúdo do documento nem o envia para um servidor de análise.",
            "Não introduza dados pessoais ou confidenciais em campos de demonstração. Se o produto passar a processar informação real, esta política deverá ser atualizada para identificar os responsáveis, finalidades, prazos de conservação e fornecedores envolvidos.",
          ],
        },
        {
          title: "Informação e armazenamento",
          paragraphs: [
            "A aplicação não implementa atualmente uma conta ligada a um serviço de armazenamento de CV. A preferência opcional desta página é guardada apenas no armazenamento local do navegador e pode ser removida ao limpar os dados do site.",
            "O navegador e a infraestrutura de alojamento podem processar dados técnicos necessários para entregar e proteger páginas web. Consulte também as definições e informações do navegador que utiliza.",
          ],
        },
        {
          title: "Os seus controlos",
          paragraphs: [
            "Pode deixar de utilizar a demonstração a qualquer momento. Para apagar a preferência de cookies guardada, limpe os dados locais do site nas definições do seu navegador.",
          ],
        },
        {
          title: "Alterações a esta política",
          paragraphs: [
            "Esta informação poderá ser revista quando as funcionalidades ou o tratamento de dados do CVViews mudarem. A data no início da página indica a revisão mais recente.",
          ],
        },
      ]}
    />
  );
}