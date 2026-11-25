/**
 * Contraste WCAG 2.2 entre as cores do sistema, incluindo o texto sobre o vidro no pior fundo
 * possível (spec 9.3: "medido contra o pior fundo possível"). Usado pelo /styleguide e por
 * scripts/check-contraste.mjs.
 *
 * Direção "Misto" (D23). Pior fundo de cada vidro:
 *   - vidro navy (cabeçalho, WhatsApp, CTA fixa): passa sobre o conteúdo claro → branco puro;
 *   - botão primário no claro: branco; no navy: o próprio navy;
 *   - botão secundário no claro: a faixa alternada (#efece5), a mais escura do conteúdo.
 * De cada gradiente vale a ponta menos opaca. O desfoque não entra (só aproxima as cores).
 * Os valores abaixo espelham src/styles/tokens.css e brand-lumi.css; mudou lá, mude aqui.
 */

export type RGB = [number, number, number];
export type Camada = { cor: string; alfa: number };

export function hexParaRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as RGB;
}

export function rgbParaHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
}

/** Empilha camadas translúcidas sobre uma base opaca (alpha compositing). */
export function compor(base: string, camadas: Camada[]): string {
  let atual = hexParaRgb(base);
  for (const { cor, alfa } of camadas) {
    const c = hexParaRgb(cor);
    atual = atual.map((v, i) => c[i] * alfa + v * (1 - alfa)) as RGB;
  }
  return rgbParaHex(atual);
}

function luminancia(hex: string): number {
  const [r, g, b] = hexParaRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function razao(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100;
}

export const piorFundo = {
  claro: '#ffffff',
  faixa: '#efece5',
  navy: '#000523',
};

/** Cor resultante de cada vidro sobre o seu pior fundo (a ponta menos opaca do gradiente). */
export const vidros = {
  navy: compor(piorFundo.claro, [{ cor: '#000523', alfa: 0.86 }]),
  navyHover: compor(piorFundo.claro, [{ cor: '#000523', alfa: 0.88 }]),
  primarioClaro: compor(piorFundo.claro, [{ cor: '#000523', alfa: 0.88 }]),
  primarioNavy: compor(piorFundo.navy, [{ cor: '#f3f0e8', alfa: 0.88 }]),
  secundarioClaro: compor(piorFundo.faixa, [{ cor: '#ffffff', alfa: 0.5 }]),
  lumiPrimarioClaro: compor(piorFundo.claro, [{ cor: '#023c80', alfa: 0.9 }]),
  lumiPrimarioNavy: compor(piorFundo.navy, [{ cor: '#024b98', alfa: 0.9 }]),
};

export type Par = { nome: string; texto: string; fundo: string; minimo: number };

/** Pares verificados. Mínimo 4,5 para texto; 3 para elementos gráficos e foco (WCAG 1.4.11). */
export const pares: Par[] = [
  // Conteúdo claro
  { nome: 'Texto · papel', texto: '#2b3044', fundo: '#f6f4ef', minimo: 4.5 },
  { nome: 'Texto · cartão branco', texto: '#2b3044', fundo: '#ffffff', minimo: 4.5 },
  { nome: 'Texto · faixa alternada', texto: '#2b3044', fundo: '#efece5', minimo: 4.5 },
  { nome: 'Texto secundário · papel', texto: '#5b6178', fundo: '#f6f4ef', minimo: 4.5 },
  { nome: 'Texto secundário · faixa alternada', texto: '#5b6178', fundo: '#efece5', minimo: 4.5 },
  { nome: 'Títulos e links navy · papel', texto: '#000523', fundo: '#f6f4ef', minimo: 4.5 },
  { nome: 'Link hover teal escuro · papel', texto: '#00707d', fundo: '#f6f4ef', minimo: 4.5 },
  { nome: 'Link hover teal escuro · faixa', texto: '#00707d', fundo: '#efece5', minimo: 4.5 },
  { nome: 'Foco navy · papel (gráfico)', texto: '#000523', fundo: '#f6f4ef', minimo: 3 },
  // Topo navy
  { nome: 'Navy · texto · fundo', texto: '#c9ccd6', fundo: '#000523', minimo: 4.5 },
  { nome: 'Navy · texto · superfície 2', texto: '#c9ccd6', fundo: '#0e1438', minimo: 4.5 },
  { nome: 'Navy · secundário · fundo', texto: '#9aa0b3', fundo: '#000523', minimo: 4.5 },
  { nome: 'Navy · secundário · superfície 2', texto: '#9aa0b3', fundo: '#0e1438', minimo: 4.5 },
  { nome: 'Navy · títulos creme · fundo', texto: '#f3f0e8', fundo: '#000523', minimo: 4.5 },
  { nome: 'Navy · link teal · superfície 2', texto: '#02b9ca', fundo: '#0e1438', minimo: 4.5 },
  {
    nome: 'Navy · link hover ciano · superfície 2',
    texto: '#01ffff',
    fundo: '#0e1438',
    minimo: 4.5,
  },
  { nome: 'Navy · foco ciano (gráfico)', texto: '#01ffff', fundo: '#000523', minimo: 3 },
  // Vidro
  {
    nome: 'Creme · cabeçalho navy sobre branco',
    texto: '#f3f0e8',
    fundo: vidros.navy,
    minimo: 4.5,
  },
  { nome: 'Creme · cabeçalho hover', texto: '#f3f0e8', fundo: vidros.navyHover, minimo: 4.5 },
  {
    nome: 'Branco · primário no claro',
    texto: '#ffffff',
    fundo: vidros.primarioClaro,
    minimo: 4.5,
  },
  {
    nome: 'Navy · primário creme no navy',
    texto: '#000523',
    fundo: vidros.primarioNavy,
    minimo: 4.5,
  },
  {
    nome: 'Navy · secundário no claro',
    texto: '#000523',
    fundo: vidros.secundarioClaro,
    minimo: 4.5,
  },
  // Lumi
  { nome: 'Lumi · link #024B98 · papel', texto: '#024b98', fundo: '#f6f4ef', minimo: 4.5 },
  { nome: 'Lumi · link #024B98 · faixa', texto: '#024b98', fundo: '#efece5', minimo: 4.5 },
  { nome: 'Lumi · #0079B6 · papel (gráfico)', texto: '#0079b6', fundo: '#f6f4ef', minimo: 3 },
  { nome: 'Lumi · link no navy', texto: '#5cb8e6', fundo: '#0e1438', minimo: 4.5 },
  {
    nome: 'Lumi · branco · primário no claro',
    texto: '#ffffff',
    fundo: vidros.lumiPrimarioClaro,
    minimo: 4.5,
  },
  {
    nome: 'Lumi · branco · primário no navy',
    texto: '#ffffff',
    fundo: vidros.lumiPrimarioNavy,
    minimo: 4.5,
  },
];

export function avaliar(lista: Par[] = pares) {
  return lista.map((p) => ({
    ...p,
    razao: razao(p.texto, p.fundo),
    ok: razao(p.texto, p.fundo) >= p.minimo,
  }));
}
