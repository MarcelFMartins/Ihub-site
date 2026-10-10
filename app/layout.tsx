import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NoZoom from "@/components/NoZoom";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "iHub Brasil — iPhone, MacBook, iPad e acessórios Apple",
  description:
    "Produtos Apple originais à pronta entrega. iPhone 18 Pro, iPhone Duo, MacBook, iPad, AirPods e acessórios. Loja em União da Vitória/PR, enviamos para todo o Brasil.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "iHub Brasil",
    description: "Produtos Apple originais à pronta entrega. Enviamos para todo o Brasil.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#0B1533", width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sans.variable}>
      <body>
        <NoZoom />
        {children}
      </body>
    </html>
  );
}
