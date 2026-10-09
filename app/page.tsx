import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ColorShowcase from "@/components/ColorShowcase";
import CameraZoom from "@/components/CameraZoom";
import Explore360 from "@/components/Explore360";
import Lineup from "@/components/Lineup";
import Ecosystem from "@/components/Ecosystem";
import WhyStack from "@/components/WhyStack";
import Store from "@/components/Store";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import { wa } from "@/lib/data";

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <ColorShowcase />
        <CameraZoom />
        <Explore360 />
        <Lineup />
        <Ecosystem />
        <Marquee tone="navy" reverse />
        <WhyStack />
        <Store />
        <FinalCTA />
      </main>
      <Footer />
      <a className="wa-float" href={wa()} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .3-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z" />
        </svg>
      </a>
    </SmoothScroll>
  );
}
