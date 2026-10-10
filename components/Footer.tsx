import Logo from "./Logo";
import { ADDRESS, CITY, INSTAGRAM_HANDLE, INSTAGRAM_URL, MAPS_URL, WHATSAPP_DISPLAY, wa } from "@/lib/data";

export default function Footer({ home = true }: { home?: boolean }) {
  const h = home ? "" : "/";
  return (
    <footer className="footer">
      <div className="footer__top">
        <Logo className="footer__logo" ink="#0B1533" />
        <div className="footer__cols">
          <div>
            <span>Produtos</span>
            <a href={`${h}#linha`}>iPhone</a>
            <a href="/catalogo">Catálogo</a>
            <a href={`${h}#ecossistema`}>MacBook</a>
            <a href={`${h}#ecossistema`}>iPad</a>
            <a href={`${h}#ecossistema`}>AirPods & acessórios</a>
          </div>
          <div>
            <span>Contato</span>
            <a href={wa()} target="_blank" rel="noopener">
              {WHATSAPP_DISPLAY}
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
              {INSTAGRAM_HANDLE}
            </a>
          </div>
          <div>
            <span>Loja</span>
            <a href={MAPS_URL} target="_blank" rel="noopener">
              {ADDRESS}
              <br />
              {CITY}
            </a>
          </div>
        </div>
      </div>
      <div className="footer__big" aria-hidden>
        iHub
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} iHub Brasil. Todos os direitos reservados.</span>
        <span>Revendedor independente. Apple, iPhone, iPad, MacBook e AirPods são marcas da Apple Inc.</span>
      </div>
    </footer>
  );
}
