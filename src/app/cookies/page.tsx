import type { Metadata } from "next";
import { CookiePreference } from "@/components/CookiePreference";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Cookies | CVViews",
  description: "Informação sobre cookies e preferências no CVViews.",
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookies e armazenamento local"
      intro="Explicamos que tecnologias são utilizadas nesta versão e pode guardar a sua preferência no navegador."
      sections={[
        {
          title: "O que são cookies",
          paragraphs: [
            "Cookies são pequenos ficheiros que um site pode guardar no navegador. Tecnologias semelhantes, como o armazenamento local, também podem guardar informação no dispositivo.",
          ],
        },
        {
          title: "O que o CVViews utiliza atualmente",
          paragraphs: [
            "O código da aplicação não integra atualmente cookies próprios de análise, publicidade ou personalização. A preferência abaixo é guardada no armazenamento local do navegador, não num cookie, e serve apenas para registar a escolha feita nesta página.",
            "O navegador ou a infraestrutura técnica que entrega o site podem utilizar mecanismos estritamente técnicos. As respetivas definições dependem do navegador e do serviço de alojamento.",
          ],
        },
        {
          title: "Alterar ou apagar a escolha",
          paragraphs: [
            "Pode alterar a opção e guardar novamente. Também pode apagar a preferência ao limpar os dados locais do CVViews nas definições do navegador.",
          ],
        },
      ]}
    >
      <CookiePreference />
    </LegalDocument>
  );
}