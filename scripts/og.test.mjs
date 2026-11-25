import assert from 'node:assert/strict';
import { test } from 'node:test';
import sharp from 'sharp';
import { gerarOg, tamanhoTitulo } from '../src/lib/og/imagem.ts';
import { rotaDoArquivo, textoH1 } from '../src/lib/og/integracao.ts';
import { arquivoOg } from '../src/lib/seo.ts';

test('rota do arquivo e arquivo OG batem com o que o <Head> calcula', () => {
  assert.equal(arquivoOg(rotaDoArquivo('index.html')), 'og/inicio.png');
  assert.equal(arquivoOg(rotaDoArquivo('para-voce/10s/index.html')), 'og/para-voce/10s.png');
  assert.equal(arquivoOg(rotaDoArquivo('404.html')), 'og/404.png');
  assert.equal(arquivoOg('/para-voce/10s/'), 'og/para-voce/10s.png');
});

test('texto do h1 sem tags e com entidades decodificadas', () => {
  assert.equal(textoH1('<h1 class="x">A &amp; <em>B</em>\n  C&#8211;D</h1>'), 'A & B C–D');
  assert.equal(textoH1('<p>sem título</p>'), null);
});

test('títulos longos usam fonte menor', () => {
  assert.ok(tamanhoTitulo('10S') > tamanhoTitulo('x'.repeat(80)));
});

test('gera PNG 1200×630 para as duas marcas', async () => {
  for (const marca of ['hugo', 'lumi']) {
    const png = await gerarOg('Liderança de alta performance', marca, 'public');
    const { width, height, format } = await sharp(png).metadata();
    assert.deepEqual([format, width, height], ['png', 1200, 630]);
  }
});
