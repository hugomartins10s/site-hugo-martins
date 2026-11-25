#!/usr/bin/env node
/**
 * Verifica o SEO base de cada página gerada (spec 7.1 e 8; critério de pronto da fase 2):
 *   - <html lang="pt-BR">, exatamente um <h1>;
 *   - <title> presente, até 70 caracteres (aviso acima de 60) e único entre as páginas;
 *   - meta description presente (é o resumo; o tamanho é decisão da spec);
 *   - canonical absoluto, igual ao og:url (a 404 não tem canonical);
 *   - Open Graph (type, title, description, url, image) e twitter:card; a imagem OG existe em dist;
 *   - um único JSON-LD válido, com @graph, sem tipos proibidos; BreadcrumbList quando há trilha.
 *
 * E as regras de conteúdo da spec que dá para verificar no HTML (verificarRegras):
 *   - nenhuma menção à Holos (marca descontinuada, spec 3.1);
 *   - nenhum preço no JSON-LD (`offers`) enquanto preço for [?] (spec 8);
 *   - produtos da frente pessoal com o aviso legal (spec 3.6) e com a identidade Hugo Martins;
 *   - Potencial Humano e Potencial Corporativo linkam o 10S (spec 4.3);
 *   - Potencial Corporativo com "É uma empresa? Veja a Lumi" (spec 5.5);
 *   - /para-empresas/ inteiro com a identidade Lumi e o aviso inverso (spec 5.6);
 *   - links internos obrigatórios da spec 4.3, contados só dentro do <main> (o menu e o rodapé
 *     linkam tudo e mascarariam a falta): produto → hub, os outros dois produtos, 2 a 4
 *     conceitos e /contato/; conceito → hub Método, outro conceito e um produto;
 *     post → um conceito e um produto.
 *
 * Uso: node scripts/check-seo.mjs <pasta-do-build>   (sai com 1 se houver erro)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tiposProibidos } from '../src/lib/schema/proibidos.ts';

const entidades = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodificar = (t) =>
  t.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, c) =>
    c[0] === '#'
      ? String.fromCodePoint(c[1] === 'x' ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10))
      : (entidades[c.toLowerCase()] ?? m),
  );

function atributos(tag) {
  const r = {};
  for (const [, nome, valor] of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) r[nome] = decodificar(valor);
  return r;
}

function metas(html) {
  const r = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = atributos(tag);
    const chave = a.property ?? a.name;
    if (chave && a.content !== undefined) r[chave] = a.content;
  }
  return r;
}

function tipos(no, acc = []) {
  if (Array.isArray(no)) no.forEach((n) => tipos(n, acc));
  else if (no && typeof no === 'object') {
    if (no['@type']) acc.push(...[no['@type']].flat());
    Object.values(no).forEach((v) => tipos(v, acc));
  }
  return acc;
}

/** Verifica uma página. Devolve { erros, avisos, titulo }. */
export function verificarPagina(html, { arquivo, existeArquivo }) {
  const erros = [];
  const avisos = [];
  const e404 = /(^|\/)404\.html$/.test(arquivo);

  if (!/<html\b[^>]*\blang="pt-BR"/.test(html)) erros.push('<html> sem lang="pt-BR"');

  const h1s = html.match(/<h1\b/gi)?.length ?? 0;
  if (h1s !== 1) erros.push(`${h1s} <h1> (precisa de exatamente 1)`);

  const titulo = decodificar(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '');
  if (!titulo) erros.push('sem <title>');
  else if (titulo.length > 70) erros.push(`title com ${titulo.length} caracteres (máx. 70)`);
  else if (titulo.length > 60) avisos.push(`title com ${titulo.length} caracteres (ideal ≤ 60)`);

  const m = metas(html);
  // A description é o `resumo` (40–80 palavras), por decisão da spec 7.1: passa de 160
  // caracteres de propósito, então aqui só se exige que exista.
  if (!m.description) erros.push('sem meta description');

  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*>/i);
  const href = canonical ? atributos(canonical[0]).href : undefined;
  if (e404) {
    if (href) erros.push('a 404 não deve ter canonical');
  } else if (!href) erros.push('sem canonical');
  else if (!/^https?:\/\//.test(href)) erros.push(`canonical não é absoluto: ${href}`);
  else if (m['og:url'] !== href) erros.push(`og:url (${m['og:url']}) diferente do canonical`);

  for (const p of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card'])
    if (!m[p]) erros.push(`sem ${p}`);
  if (m['og:image']) {
    const caminho = m['og:image'].match(/\/(og\/.+\.png)$/)?.[1];
    if (!/^https?:\/\//.test(m['og:image'])) erros.push('og:image não é absoluta');
    else if (!caminho || !existeArquivo(caminho))
      erros.push(`imagem OG não encontrada no build: ${m['og:image']}`);
  }

  const blocos = [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ];
  if (blocos.length !== 1) erros.push(`${blocos.length} blocos JSON-LD (precisa de exatamente 1)`);
  else {
    try {
      const dados = JSON.parse(blocos[0][1]);
      if (!Array.isArray(dados['@graph'])) erros.push('JSON-LD sem @graph');
      const t = tipos(dados);
      for (const proibido of tiposProibidos)
        if (t.includes(proibido)) erros.push(`JSON-LD com tipo proibido: ${proibido}`);
      if (/<nav\b[^>]*class="trilha/.test(html) && !t.includes('BreadcrumbList'))
        erros.push('trilha visível sem BreadcrumbList no JSON-LD');
    } catch (err) {
      erros.push(`JSON-LD inválido: ${err.message}`);
    }
  }

  return { erros, avisos, titulo };
}

const PRODUTOS_PESSOAIS = /^para-voce\/(10s|potencial-humano|potencial-corporativo)\/index\.html$/;
const DEPOIS_DO_10S = /^para-voce\/potencial-(humano|corporativo)\/index\.html$/;

/** Avisos cruzados (CrossFrontNotice): <aside class="cruzado …"> com o link para a outra frente. */
const avisoCruzadoPara = (html, destino) =>
  [...html.matchAll(/<aside\b[^>]*class="cruzado[\s\S]*?<\/aside>/gi)].some((m) =>
    new RegExp(`href="[^"]*${destino}"`).test(m[0]),
  );

const PRODUTO = /^(para-voce|para-empresas)\/([a-z0-9-]+)\/index\.html$/;
const CONCEITO = /^metodo\/([a-z0-9-]+)\/index\.html$/;
const POST = /^blog\/(?!tema\/|pagina\/)([a-z0-9-]+)\/index\.html$/;

/** Links do <main> (sem o menu e o rodapé), como caminhos; o base do site não importa. */
function linksDoMain(html) {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html;
  return new Set([...main.matchAll(/<a\b[^>]*\bhref="([^"#?]*)/gi)].map((m) => m[1]));
}

/** Ids distintos dos links que casam com /prefixo/<id>/ no fim do caminho. */
const idsLinkados = (links, prefixo) =>
  new Set(
    [...links]
      .map((h) => h.match(new RegExp(`/${prefixo}/([a-z0-9-]+)/$`))?.[1])
      .filter((id) => id && id !== 'tema' && id !== 'pagina'),
  );
const linka = (links, caminho) => [...links].some((h) => h.endsWith(caminho));

/** Links internos obrigatórios (spec 4.3). Devolve a lista de erros. */
export function verificarLigacoes(html, { arquivo }) {
  const erros = [];
  const links = linksDoMain(html);
  const conceitos = idsLinkados(links, 'metodo');
  const produtos = new Set([
    ...idsLinkados(links, 'para-voce'),
    ...idsLinkados(links, 'para-empresas'),
  ]);

  const produto = arquivo.match(PRODUTO);
  if (produto) {
    const [, frente, id] = produto;
    const irmaos = [...idsLinkados(links, frente)].filter((x) => x !== id);
    if (!linka(links, `/${frente}/`)) erros.push(`produto sem link para o hub /${frente}/`);
    if (irmaos.length < 2) erros.push(`produto linka ${irmaos.length} dos outros dois produtos`);
    if (conceitos.size < 2 || conceitos.size > 4)
      erros.push(`produto linka ${conceitos.size} conceitos do Método (precisa de 2 a 4)`);
    if (!linka(links, '/contato/')) erros.push('produto sem link para /contato/');
  }

  const conceito = arquivo.match(CONCEITO);
  if (conceito) {
    if (!linka(links, '/metodo/')) erros.push('conceito sem link para o hub /metodo/');
    if ([...conceitos].filter((x) => x !== conceito[1]).length === 0)
      erros.push('conceito sem link para um conceito vizinho');
    if (produtos.size === 0) erros.push('conceito sem link para um produto');
  }

  if (POST.test(arquivo)) {
    if (conceitos.size === 0) erros.push('post sem link para um conceito');
    if (produtos.size === 0) erros.push('post sem link para um produto');
  }
  return erros;
}

/** Regras de conteúdo da spec verificáveis no HTML. Devolve a lista de erros. */
export function verificarRegras(html, { arquivo }) {
  const erros = [];
  const lumi = /<html\b[^>]*\bdata-brand="lumi"/.test(html);

  if (/holos/i.test(html)) erros.push('menciona a Holos (marca descontinuada)');
  if (/"offers"\s*:/.test(html)) erros.push('JSON-LD com offers/preço (preço ainda é [?])');

  if (PRODUTOS_PESSOAIS.test(arquivo)) {
    if (!/<aside\b[^>]*aria-label="Aviso legal"/.test(html))
      erros.push('produto da frente pessoal sem o aviso legal');
    if (lumi) erros.push('produto da frente pessoal com a identidade Lumi');
  }
  if (DEPOIS_DO_10S.test(arquivo) && !/href="[^"]*\/para-voce\/10s\/"/.test(html))
    erros.push('não linka o 10S como pré-requisito');
  if (
    /^para-voce\/potencial-corporativo\//.test(arquivo) &&
    !avisoCruzadoPara(html, '/para-empresas/')
  )
    erros.push('sem o aviso "É uma empresa? Veja a Lumi"');

  if (/^para-empresas\//.test(arquivo)) {
    if (!lumi) erros.push('página da Lumi sem data-brand="lumi"');
    if (!avisoCruzadoPara(html, '/para-voce/'))
      erros.push('sem o aviso "Procura o trabalho individual? Veja Para você"');
  }
  return erros;
}

function htmls(pasta) {
  return readdirSync(pasta, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.html'))
    .map((f) => join(pasta, f));
}

export function verificarPasta(pasta) {
  const resultados = [];
  const titulos = new Map();
  for (const arquivo of htmls(pasta)) {
    const rel = relative(pasta, arquivo).split('\\').join('/');
    const html = readFileSync(arquivo, 'utf8');
    const r = verificarPagina(html, {
      arquivo: rel,
      existeArquivo: (c) => existsSync(join(pasta, c)),
    });
    r.erros.push(
      ...verificarRegras(html, { arquivo: rel }),
      ...verificarLigacoes(html, { arquivo: rel }),
    );
    if (r.titulo) titulos.set(r.titulo, [...(titulos.get(r.titulo) ?? []), rel]);
    resultados.push({ arquivo: rel, ...r });
  }
  for (const [titulo, arquivos] of titulos)
    if (arquivos.length > 1)
      for (const r of resultados)
        if (arquivos.includes(r.arquivo))
          r.erros.push(`title repetido em ${arquivos.length} páginas: "${titulo}"`);
  return resultados;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const pasta = process.argv[2] ?? 'dist';
  const resultados = verificarPasta(pasta);
  let erros = 0;
  for (const { arquivo, erros: e, avisos: a } of resultados) {
    for (const x of e) console.error(`✗ ${arquivo}: ${x}`);
    for (const x of a) console.warn(`! ${arquivo}: ${x}`);
    erros += e.length;
  }
  if (erros) {
    console.error(`\n✗ SEO base: ${erros} erro(s) em ${resultados.length} páginas.`);
    process.exit(1);
  }
  console.log(
    `✓ SEO base: ${resultados.length} páginas ok (h1, title, canonical, OG, JSON-LD, regras e links da spec).`,
  );
}
