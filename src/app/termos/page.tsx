import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Termos de serviço | CVViews",
  description: "Consulte as condições de utilização da demonstração CVViews.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de serviço"
      intro="Ao utilizar o CVViews, aceita estas condições para a versão de demonstração do serviço."
      sections={[
        {
          title: "O que o serviço disponibiliza",
          paragraphs: [
            "O CVViews apresenta ferramentas demonstrativas de apoio à preparação de CV e entrevistas. As análises e recomendações visíveis nesta versão podem ser exemplos simulados e não constituem uma avaliação real do documento selecionado.",
            "O serviço é fornecido tal como está e pode ser alterado, suspenso ou removido durante o desenvolvimento.",
          ],
        },
        {
          title: "Utilização responsável",
          paragraphs: ["Ao utilizar o site, compromete-se a:"],
          bullets: [
            "Utilizar a demonstração de forma lícita e não tentar comprometer a segurança ou disponibilidade do site.",
            "Não confiar nos resultados como garantia de emprego, aprovação num sistema ATS ou aconselhamento profissional.",
            "Evitar carregar documentos com informação pessoal, confidencial ou pertencente a terceiros.",
          ],
        },
        {
          title: "Conteúdos e resultados",
          paragraphs: [
            "É responsável por garantir que tem autorização para utilizar qualquer conteúdo que introduza. Os exemplos gerados pela demonstração servem apenas para fins informativos; deve verificar a sua exatidão e adequação antes de os utilizar.",
          ],
        },
        {
          title: "Limitação da demonstração",
          paragraphs: [
            "O CVViews não garante que o site esteja sempre disponível ou livre de erros. Na medida permitida pela lei aplicável, não assumimos responsabilidade por decisões tomadas exclusivamente com base em exemplos ou resultados demonstrativos.",
          ],
        },
        {
          title: "Alterações e contacto",
          paragraphs: [
            "Estes termos podem ser atualizados à medida que o serviço evolui. A versão publicada nesta página é a aplicável à utilização atual da demonstração.",
          ],
        },
      ]}
    />
  );
}