/**
 * Endereços usados no <head> e no JSON-LD (spec 7.1 e 8). Tudo absoluto, a partir de `site` +
 * `base` do astro.config (SITE_URL e BASE_PATH).
 */

/** Endereço absoluto da página inicial, com a barra final (ex.: https://x.github.io/repo/). */
export function urlInicio(site: URL | undefined): string {
  if (!site) throw new Error('Defina SITE_URL: canonical e JSON-LD precisam de URL absoluta.');
  return new URL(import.meta.env.BASE_URL, site).href;
}

/** Endereço absoluto de um caminho que já inclui o base (como Astro.url.pathname). */
export function urlAbsolutaDoCaminho(caminho: string, site: URL | undefined): string {
  if (!site) throw new Error('Defina SITE_URL: canonical e JSON-LD precisam de URL absoluta.');
  return new URL(caminho, site).href;
}

/**
 * Arquivo da imagem OG de uma rota, relativo à raiz do site publicado (sem o base).
 * "/" → "og/inicio.png"; "/para-voce/10s/" → "og/para-voce/10s.png".
 * A integração src/lib/og/integracao.ts gera exatamente esses arquivos no build.
 */
export function arquivoOg(rotaSemBase: string): string {
  const limpa = rotaSemBase.replace(/^\/+|\/+$/g, '');
  return `og/${limpa || 'inicio'}.png`;
}

/** Tira o base do caminho (Astro.url.pathname inclui o base). */
export function semBase(caminho: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base && caminho.startsWith(base) ? caminho.slice(base.length) || '/' : caminho;
}

export const OG_LARGURA = 1200;
export const OG_ALTURA = 630;
