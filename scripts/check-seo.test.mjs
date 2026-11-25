import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  verificarLigacoes,
  verificarPagina,
  verificarPasta,
  verificarRegras,
} from './check-seo.mjs';

const ld = (grafo) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo })}</script>`;

function pagina({
  h1 = '<h1>Título</h1>',
  titulo = 'Página de teste',
  canonical = 'https://x.dev/a/',
  grafo = [{ '@type': 'WebPage' }],
  extra = '',
} = {}) {
  return `<!doctype html><html lang="pt-BR"><head><title>${titulo}</title>
<meta name="description" content="Resumo da página.">
${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
<meta property="og:type" content="website"><meta property="og:title" content="${titulo}">
<meta property="og:description" content="Resumo."><meta property="og:url" content="${canonical}">
<meta property="og:image" content="https://x.dev/og/a.png"><meta name="twitter:card" content="summary_large_image">
${ld(grafo)}</head><body>${extra}${h1}</body></html>`;
}

const ctx = { arquivo: 'a/index.html', existeArquivo: () => true };

test('página completa passa', () => {
  assert.deepEqual(verificarPagina(pagina(), ctx).erros, []);
});

test('dois h1 ou nenhum quebram', () => {
  assert.match(verificarPagina(pagina({ h1: '<h1>a</h1><h1>b</h1>' }), ctx).erros[0], /2 <h1>/);
  assert.match(verificarPagina(pagina({ h1: '' }), ctx).erros[0], /0 <h1>/);
});

test('sem canonical quebra, exceto na 404', () => {
  const sem = pagina({ canonical: '' });
  assert.ok(verificarPagina(sem, ctx).erros.includes('sem canonical'));
  const e404 = verificarPagina(sem, { ...ctx, arquivo: '404.html' }).erros;
  assert.ok(!e404.includes('sem canonical'));
});

test('tipo proibido no JSON-LD quebra', () => {
  const r = verificarPagina(pagina({ grafo: [{ '@type': 'FAQPage' }] }), ctx);
  assert.ok(r.erros.some((e) => /FAQPage/.test(e)));
});

test('trilha visível exige BreadcrumbList', () => {
  const extra = '<nav class="trilha" aria-label="Trilha"></nav>';
  assert.ok(verificarPagina(pagina({ extra }), ctx).erros.some((e) => /BreadcrumbList/.test(e)));
  const ok = pagina({ extra, grafo: [{ '@type': 'BreadcrumbList' }] });
  assert.deepEqual(verificarPagina(ok, ctx).erros, []);
});

test('imagem OG ausente no build quebra', () => {
  const r = verificarPagina(pagina(), { ...ctx, existeArquivo: () => false });
  assert.ok(r.erros.some((e) => /imagem OG/.test(e)));
});

test('title repetido entre páginas quebra', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'seo-'));
  mkdirSync(join(pasta, 'og'));
  writeFileSync(join(pasta, 'og', 'a.png'), '');
  mkdirSync(join(pasta, 'a'));
  writeFileSync(join(pasta, 'index.html'), pagina());
  writeFileSync(join(pasta, 'a', 'index.html'), pagina());
  const r = verificarPasta(pasta);
  assert.ok(r.every((p) => p.erros.some((e) => /title repetido/.test(e))));
});

// Regras de conteúdo da spec (verificarRegras)
const html = ({ lumi = false, corpo = '' } = {}) =>
  `<!doctype html><html lang="pt-BR"${lumi ? ' data-brand="lumi"' : ''}><body>${corpo}</body></html>`;
const aviso =
  '<aside class="aviso aviso--pagina superficie" aria-label="Aviso legal"><p>x</p></aside>';
const cruzado = (destino) =>
  `<aside class="cruzado superficie" aria-label="x"><p><a href="/base${destino}">x</a></p></aside>`;
const link10s = '<a href="/base/para-voce/10s/">10S</a>';

test('regras: produto pessoal sem aviso legal quebra', () => {
  const r = verificarRegras(html({ corpo: link10s }), {
    arquivo: 'para-voce/potencial-humano/index.html',
  });
  assert.ok(r.includes('produto da frente pessoal sem o aviso legal'));
  assert.deepEqual(
    verificarRegras(html({ corpo: aviso + link10s }), {
      arquivo: 'para-voce/potencial-humano/index.html',
    }),
    [],
  );
});

test('regras: Potencial Corporativo exige o aviso para a Lumi e o link do 10S', () => {
  const arquivo = 'para-voce/potencial-corporativo/index.html';
  const r = verificarRegras(html({ corpo: aviso }), { arquivo });
  assert.ok(r.includes('não linka o 10S como pré-requisito'));
  assert.ok(r.includes('sem o aviso "É uma empresa? Veja a Lumi"'));
  assert.deepEqual(
    verificarRegras(html({ corpo: aviso + link10s + cruzado('/para-empresas/') }), { arquivo }),
    [],
  );
});

test('regras: /para-empresas/ exige identidade Lumi e aviso inverso', () => {
  const arquivo = 'para-empresas/lideranca-de-alta-performance/index.html';
  assert.equal(verificarRegras(html({ corpo: cruzado('/para-voce/') }), { arquivo }).length, 1);
  assert.deepEqual(
    verificarRegras(html({ lumi: true, corpo: cruzado('/para-voce/') }), { arquivo }),
    [],
  );
  assert.ok(
    verificarRegras(html({ lumi: true }), { arquivo }).includes(
      'sem o aviso "Procura o trabalho individual? Veja Para você"',
    ),
  );
});

test('regras: Holos e offers quebram em qualquer página', () => {
  const r = verificarRegras(html({ corpo: 'Holos Consultant <script>{"offers": {}}</script>' }), {
    arquivo: 'index.html',
  });
  assert.equal(r.length, 2);
});

// Links internos obrigatórios (spec 4.3), contados só dentro do <main>
const a = (href) => `<a href="/base${href}">x</a>`;
const comMain = (dentro, fora = '') =>
  `<html><body><nav>${fora}</nav><main id="conteudo">${dentro}</main></body></html>`;

test('ligações: produto completo passa', () => {
  const corpo = [
    '/para-voce/',
    '/para-voce/10s/',
    '/para-voce/potencial-corporativo/',
    '/metodo/jogos-de-poder/',
    '/metodo/reiki-da-alma/',
    '/contato/',
  ]
    .map(a)
    .join('');
  const arquivo = 'para-voce/potencial-humano/index.html';
  assert.deepEqual(verificarLigacoes(comMain(corpo), { arquivo }), []);
});

test('ligações: links do menu não contam para o produto', () => {
  const menu = ['/para-voce/', '/para-voce/10s/', '/metodo/a/', '/metodo/b/', '/contato/']
    .map(a)
    .join('');
  const r = verificarLigacoes(comMain('', menu), {
    arquivo: 'para-voce/potencial-humano/index.html',
  });
  assert.equal(r.length, 4);
});

test('ligações: produto com 1 ou 5 conceitos quebra', () => {
  const arquivo = 'para-empresas/lideranca-de-alta-performance/index.html';
  const um = comMain(a('/metodo/a/'));
  const cinco = comMain(['a', 'b', 'c', 'd', 'e'].map((c) => a(`/metodo/${c}/`)).join(''));
  assert.ok(verificarLigacoes(um, { arquivo }).some((e) => /1 conceitos/.test(e)));
  assert.ok(verificarLigacoes(cinco, { arquivo }).some((e) => /5 conceitos/.test(e)));
});

test('ligações: conceito exige hub, vizinho e produto; post exige conceito e produto', () => {
  const sóHub = comMain(a('/metodo/') + a('/metodo/metacognicao/'));
  assert.deepEqual(verificarLigacoes(sóHub, { arquivo: 'metodo/metacognicao/index.html' }), [
    'conceito sem link para um conceito vizinho',
    'conceito sem link para um produto',
  ]);
  const post = comMain(
    a('/metodo/jogos-de-poder/') + a('/para-empresas/lideranca-de-alta-performance/'),
  );
  assert.deepEqual(verificarLigacoes(post, { arquivo: 'blog/um-post/index.html' }), []);
  assert.equal(verificarLigacoes(comMain(''), { arquivo: 'blog/um-post/index.html' }).length, 2);
  assert.deepEqual(verificarLigacoes(comMain(''), { arquivo: 'blog/tema/emocoes/index.html' }), []);
});
