/**
 * Contraste WCAG 2.2 entre as cores do sistema, incluindo o texto sobre o vidro no pior fundo
 * possível (spec 9.3: "medido contra o pior fundo possível"). Usado pelo /styleguide e por
 * scripts/check-contraste.mjs.
 *
 * O pior fundo é o pico da mancha de luz mais clara, com o padrão de cérebros no pixel mais claro
 * (#6bfbf8), sem considerar o desfoque (que só escurece o pico): é uma estimativa conservadora.
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

const PATTERN_CLARO = '#6bfbf8';

/** Pior fundo atrás do vidro em cada marca. */
export const piorFundo = {
  hugo: compor('#000523', [
    { cor: '#01ffff', alfa: 0.2 }, // --glow-1
    { cor: PATTERN_CLARO, alfa: 0.06 }, // --pattern-opacity
  ]),
  lumi: compor('#000523', [{ cor: '#0079b6', alfa: 0.34 }]), // --glow-1 Lumi; sem padrão
};

/** Cor resultante de cada vidro sobre o pior fundo (o lado mais claro de cada gradiente). */
export const vidros = {
  neutro: compor(piorFundo.hugo, [{ cor: '#ffffff', alfa: 0.14 }]),
  neutroHover: compor(piorFundo.hugo, [{ cor: '#ffffff', alfa: 0.2 }]),
  primario: compor(piorFundo.hugo, [
    { cor: '#000523', alfa: 0.45 },
    { cor: '#01ffff', alfa: 0.28 },
  ]),
  primarioHover: compor(piorFundo.hugo, [
    { cor: '#000523', alfa: 0.45 },
    { cor: '#01ffff', alfa: 0.34 },
  ]),
  semBackdrop: compor(piorFundo.hugo, [{ cor: '#0b1445', alfa: 0.92 }]),
  lumiNeutro: compor(piorFundo.lumi, [{ cor: '#ffffff', alfa: 0.14 }]),
  lumiPrimario: compor(piorFundo.lumi, [
    { cor: '#000523', alfa: 0.4 },
    { cor: '#0079b6', alfa: 0.55 },
  ]),
  lumiPrimarioHover: compor(piorFundo.lumi, [
    { cor: '#000523', alfa: 0.4 },
    { cor: '#0079b6', alfa: 0.65 },
  ]),
};

export type Par = { nome: string; texto: string; fundo: string; minimo: number };

/** Pares verificados. Mínimo 4,5 para texto; 3 para elementos gráficos e foco (WCAG 1.4.11). */
export const pares: Par[] = [
  { nome: 'Texto · fundo navy', texto: '#eaf4fb', fundo: '#000523', minimo: 4.5 },
  { nome: 'Texto · superfície 1', texto: '#eaf4fb', fundo: '#060c33', minimo: 4.5 },
  { nome: 'Texto · superfície 2', texto: '#eaf4fb', fundo: '#0b1445', minimo: 4.5 },
  { nome: 'Texto · superfície 3 (hover)', texto: '#eaf4fb', fundo: '#121d57', minimo: 4.5 },
  { nome: 'Texto secundário · superfície 1', texto: '#9fb0d0', fundo: '#060c33', minimo: 4.5 },
  { nome: 'Texto secundário · superfície 2', texto: '#9fb0d0', fundo: '#0b1445', minimo: 4.5 },
  { nome: 'Link teal · navy', texto: '#02b9ca', fundo: '#000523', minimo: 4.5 },
  { nome: 'Link teal · superfície 1', texto: '#02b9ca', fundo: '#060c33', minimo: 4.5 },
  { nome: 'Link teal · superfície 2', texto: '#02b9ca', fundo: '#0b1445', minimo: 4.5 },
  { nome: 'Link hover ciano · superfície 2', texto: '#01ffff', fundo: '#0b1445', minimo: 4.5 },
  { nome: 'Foco ciano · navy (gráfico)', texto: '#01ffff', fundo: '#000523', minimo: 3 },
  {
    nome: 'Branco · vidro neutro (pior fundo)',
    texto: '#ffffff',
    fundo: vidros.neutro,
    minimo: 4.5,
  },
  { nome: 'Branco · vidro neutro hover', texto: '#ffffff', fundo: vidros.neutroHover, minimo: 4.5 },
  {
    nome: 'Branco · botão primário (pior fundo)',
    texto: '#ffffff',
    fundo: vidros.primario,
    minimo: 4.5,
  },
  {
    nome: 'Branco · botão primário hover',
    texto: '#ffffff',
    fundo: vidros.primarioHover,
    minimo: 4.5,
  },
  {
    nome: 'Branco · vidro sem backdrop-filter',
    texto: '#ffffff',
    fundo: vidros.semBackdrop,
    minimo: 4.5,
  },
  { nome: 'Lumi · texto · superfície 1', texto: '#eaf4fb', fundo: '#06102f', minimo: 4.5 },
  {
    nome: 'Lumi · texto secundário · superfície 2',
    texto: '#9fb0d0',
    fundo: '#0a1a46',
    minimo: 4.5,
  },
  { nome: 'Lumi · link · superfície 1', texto: '#5cb8e6', fundo: '#06102f', minimo: 4.5 },
  { nome: 'Lumi · link · superfície 2', texto: '#5cb8e6', fundo: '#0a1a46', minimo: 4.5 },
  {
    nome: 'Lumi · azul da marca #0079B6 · navy (gráfico)',
    texto: '#0079b6',
    fundo: '#000523',
    minimo: 3,
  },
  { nome: 'Lumi · branco · vidro neutro', texto: '#ffffff', fundo: vidros.lumiNeutro, minimo: 4.5 },
  {
    nome: 'Lumi · branco · botão primário',
    texto: '#ffffff',
    fundo: vidros.lumiPrimario,
    minimo: 4.5,
  },
  {
    nome: 'Lumi · branco · botão primário hover',
    texto: '#ffffff',
    fundo: vidros.lumiPrimarioHover,
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
