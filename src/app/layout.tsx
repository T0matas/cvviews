import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { PageEntrance } from "@/components/PageEntrance";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "CVViews – Diagnóstico de CV e Simulação de Entrevistas com IA",
  description:
    "Carregue o seu CV, descubra o que está bem e o que precisa de melhorar, converse com o mentor de IA e crie simulações de entrevistas personalizadas.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={manrope.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600;1,700&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#f4efe6]">
        <SmoothScroll>
          <>
            <PageEntrance>{children}</PageEntrance>
            <CookieConsentBanner />
          </>
        </SmoothScroll>
      </body>
    </html>
  );
}
