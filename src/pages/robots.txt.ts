import type { APIRoute } from 'astro';
import { HOMOLOGACAO } from 'astro:env/server';

// Homologação: nada é indexado. Produção: a lista completa de rastreadores (spec 7.2)
// entra na fase 5, depois de conferir os nomes atuais nas documentações oficiais.
// A linha `Sitemap:` também entra na fase 5, junto com o sitemap.
export const GET: APIRoute = () => {
  const corpo = HOMOLOGACAO ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';
  return new Response(corpo, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
