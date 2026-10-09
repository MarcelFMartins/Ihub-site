# iHub Brasil — site

Site institucional/vitrine da **iHub Brasil** (revendedora Apple em União da Vitória/PR).

Stack: **Next.js 15 (App Router) + TypeScript**, GSAP + ScrollTrigger, Lenis (smooth scroll), Three.js com React Three Fiber/Drei (iPhone 3D).

## Rodar

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Estrutura

- `app/` — layout, página e estilos globais (`globals.css`, paleta da marca em `:root`).
- `components/` — uma seção por arquivo (Hero, ColorShowcase, CameraZoom, Explore360, Lineup, Ecosystem, WhyStack, Store, FinalCTA…).
- `components/three/` — modelo 3D do iPhone (`Phone.tsx`) e cenas (`PhoneScene.tsx`).
- `lib/data.ts` — **WhatsApp, Instagram, endereço, cores e lista de produtos**. Edite aqui.
- `public/products`, `public/apple` — fotos oficiais dos produtos.
- `public/insta` — fotos da loja/posts do Instagram @iphones.ihub.
- `public/logo-white.svg`, `public/logo-navy.svg`, `components/Logo.tsx` — logo vetorizado.

## Paleta

| Token | Cor |
| --- | --- |
| Marinho | `#0B1533` |
| Laranja | `#E8892B` |
| Dourado | `#E0A04A` |
| Creme | `#F5EEE6` |
