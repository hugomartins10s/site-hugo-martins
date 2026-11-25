/**
 * RSS do blog (spec 7.4), em /rss.xml. Feito à mão para não depender de pacote: são poucas
 * linhas de XML. Sem posts, o canal existe e fica vazio.
 */
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { empresa } from '../lib/empresa';
import { urlAbsoluta } from '../lib/links';
import { caminhoDoPost, postsOrdenados } from '../lib/posts';

const xml = (t: string) =>
  t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const blog = (await getEntry('paginas', 'blog'))!;
  const temas = await getCollection('temas');
  const posts = await postsOrdenados();
  const absoluto = (caminho: string) => urlAbsoluta(caminho, site);
  const recente = posts.reduce<Date | undefined>(
    (m, p) => (!m || p.data.atualizado > m ? p.data.atualizado : m),
    undefined,
  );

  const itens = posts.map((p) => {
    const link = absoluto(caminhoDoPost(p));
    const tema = temas.find((t) => t.id === p.data.tema.id)?.data.nome;
    return [
      '    <item>',
      `      <title>${xml(p.data.titulo)}</title>`,
      `      <link>${xml(link)}</link>`,
      `      <guid isPermaLink="true">${xml(link)}</guid>`,
      `      <description>${xml(p.data.resumo)}</description>`,
      `      <pubDate>${p.data.publicado.toUTCString()}</pubDate>`,
      `      <dc:creator>${xml(empresa.pessoa.nome)}</dc:creator>`,
      ...(tema ? [`      <category>${xml(tema)}</category>`] : []),
      '    </item>',
    ].join('\n');
  });

  const corpo = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${xml(`Blog · ${empresa.nome}`)}</title>`,
    `    <link>${xml(absoluto('/blog/'))}</link>`,
    `    <description>${xml(blog.data.resumo)}</description>`,
    '    <language>pt-BR</language>',
    `    <atom:link href="${xml(absoluto('/rss.xml'))}" rel="self" type="application/rss+xml" />`,
    ...(recente ? [`    <lastBuildDate>${recente.toUTCString()}</lastBuildDate>`] : []),
    ...itens,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(corpo, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
