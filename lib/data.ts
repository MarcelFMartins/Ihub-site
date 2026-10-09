export const WHATSAPP_NUMBER = "5542988706948";
export const WHATSAPP_DISPLAY = "(42) 9 8870-6948";
export const INSTAGRAM_URL = "https://www.instagram.com/iphones.ihub";
export const INSTAGRAM_HANDLE = "@iphones.ihub";
export const ADDRESS = "Av. Manoel Ribas, 455 — Centro";
export const CITY = "União da Vitória · PR";
export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Av.+Manoel+Ribas,+455,+Uni%C3%A3o+da+Vit%C3%B3ria+-+PR";

export const MAPS_EMBED =
  "https://www.google.com/maps?q=Av.+Manoel+Ribas,+455,+Centro,+Uni%C3%A3o+da+Vit%C3%B3ria+-+PR&z=17&output=embed";
/** Put the storefront photo in /public/store/ and set its path here (e.g. "/store/fachada.webp"). Empty = map. */
export const STORE_PHOTO = "";

export const wa = (msg = "Olá, iHub! Vim pelo site e quero saber mais sobre os produtos.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export type PhoneColor = {
  id: string;
  name: string;
  hex: string; // material colour for the 3D model
  bg: string; // section tint
  img: string;
  cam: string;
  scene: string;
};

export const PRO_COLORS: PhoneColor[] = [
  {
    id: "glacier",
    name: "Azul Glaciar",
    hex: "#8fa9c8",
    bg: "#e6edf5",
    img: "/products/18pro-glacier.webp",
    cam: "/products/18pro-glacier-cam.webp",
    scene: "/apple/color_glacier.webp",
  },
  {
    id: "burgundy",
    name: "Bordô",
    hex: "#4a1420",
    bg: "#f3e6e2",
    img: "/products/18pro-burgundy.webp",
    cam: "/products/18pro-burgundy-cam.webp",
    scene: "/apple/color_burgundy.webp",
  },
  {
    id: "black",
    name: "Preto Profundo",
    hex: "#1d1d20",
    bg: "#ece6dd",
    img: "/products/18pro-black.webp",
    cam: "/products/18pro-black-cam.webp",
    scene: "/apple/color_black.webp",
  },
  {
    id: "silver",
    name: "Prata",
    hex: "#d8d8d6",
    bg: "#f1ede6",
    img: "/products/18pro-silver.webp",
    cam: "/products/18pro-silver-cam.webp",
    scene: "/apple/color_silver.webp",
  },
];

export type Product = {
  name: string;
  tagline: string;
  img: string;
  badge?: string;
  tint: string;
};

export const LINEUP: Product[] = [
  { name: "iPhone 18 Pro", tagline: "O Pro mais Pro de todos.", img: "/products/18pro-burgundy.webp", badge: "Lançamento", tint: "#5b1e28" },
  { name: "iPhone 18 Pro Max", tagline: "Tela maior. Bateria gigante.", img: "/products/18promax-glacier.webp", badge: "Lançamento", tint: "#8fa9c8" },
  { name: "iPhone Duo", tagline: "Abre. Dobra. Surpreende.", img: "/products/duo-nightsky.webp", badge: "Novo", tint: "#2c3a55" },
  { name: "iPhone Air", tagline: "Fino como nunca.", img: "/products/air-sky.webp", tint: "#a9c4e0" },
  { name: "iPhone 17 Pro Max", tagline: "Tela gigante. Laranja Cósmico.", img: "/products/17promax-orange.webp", badge: "Pronta entrega", tint: "#e8892b" },
  { name: "iPhone 17", tagline: "Simplesmente incrível.", img: "/products/17-sage.webp", tint: "#a7b99a" },
  { name: "iPhone 17e", tagline: "O essencial, com estilo.", img: "/products/17e-pink.webp", tint: "#f2c4cf" },
  { name: "iPhone 17 Pro", tagline: "Laranja Cósmico. Ícone.", img: "/products/17pro-orange.webp", badge: "Pronta entrega", tint: "#e8892b" },
];

export const ECOSYSTEM = [
  { key: "mac", title: "MacBook", line: "Air e Pro com chip M. Leveza e potência.", img: "/products/mba15.webp", span: "wide" },
  { key: "ipad", title: "iPad", line: "Do Air ao Pro. Sua tela, suas regras.", img: "/products/ipadpro.webp", span: "tall" },
  { key: "airpods", title: "AirPods", line: "Som que envolve. Silêncio que acolhe.", img: "/products/airpodspro.webp", span: "" },
  { key: "max", title: "AirPods Max", line: "Áudio de estúdio, onde você estiver.", img: "/products/airpodsmax.webp", span: "" },
  { key: "cases", title: "Capas", line: "Proteção premium para cada modelo.", img: "/products/case-burgundy.webp", span: "" },
  { key: "magsafe", title: "MagSafe & Películas", line: "Carregadores, cabos e películas.", img: "/products/magsafe.webp", span: "" },
] as const;

export const INSTA = [
  "/insta/p2.webp",
  "/insta/p16.webp",
  "/insta/p10.webp",
  "/insta/p6.webp",
  "/insta/p9.webp",
  "/insta/p17.webp",
  "/insta/p22.webp",
  "/insta/p14.webp",
  "/insta/p20.webp",
  "/insta/p4.webp",
];
