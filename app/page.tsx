import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ColorShowcase from "@/components/ColorShowcase";
import CameraZoom from "@/components/CameraZoom";
import Explore360 from "@/components/Explore360";
import Lineup from "@/components/Lineup";
import Catalog from "@/components/Catalog";
import Ecosystem from "@/components/Ecosystem";
import WhyStack from "@/components/WhyStack";
import Store from "@/components/Store";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import BarColor from "@/components/BarColor";

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <Cursor />
      <BarColor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <ColorShowcase />
        <CameraZoom />
        <Explore360 />
        <Lineup />
        <Catalog />
        <Ecosystem />
        <Marquee tone="navy" reverse />
        <WhyStack />
        <Store />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </SmoothScroll>
  );
}
