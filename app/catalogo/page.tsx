import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Nav from "@/components/Nav";
import CatalogView from "@/components/CatalogView";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Catálogo — iHub Brasil",
  description: "iPhones lacrados, seminovos e usados em pronta entrega. iPhone 18 Pro, 18 Pro Max, 17 e muito mais.",
};

export default function CatalogoPage() {
  return (
    <SmoothScroll>
      <Cursor />
      <Nav />
      <main>
        <CatalogView />
      </main>
      <Footer home={false} />
      <WhatsAppFloat />
    </SmoothScroll>
  );
}
