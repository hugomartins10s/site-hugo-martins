/**
 * Monta um link interno respeitando o `base` do Astro (necessário na homologação do
 * GitHub Pages, que serve o site em /site-hugo-martins/). Sempre com barra final (spec 4.1).
 *
 *   url('/para-voce/10s') -> '/para-voce/10s/'                     (produção)
 *   url('/para-voce/10s') -> '/site-hugo-martins/para-voce/10s/'   (homologação)
 *   url('/rss.xml')       -> '/rss.xml'  (arquivos com extensão não levam barra final)
 */
export function url(caminho: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const limpo = '/' + caminho.replace(/^\/+/, '');
  const comBarra = /\.[a-z0-9]+$/i.test(limpo) || limpo.endsWith('/') ? limpo : `${limpo}/`;
  return `${base}${comBarra}`;
}

/** URL absoluta (canonical, OG, sitemap, schema). */
export function urlAbsoluta(caminho: string, site: URL | undefined): string {
  if (!site) throw new Error('`site` não definido em astro.config.mjs (SITE_URL).');
  return new URL(url(caminho), site).href;
}
