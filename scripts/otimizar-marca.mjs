#!/usr/bin/env node
/**
 * Gera os arquivos de marca para web (public/brand, public/img, favicons) a partir dos originais
 * em brand/. Só redimensiona, converte e copia: nunca redesenha (regra 7).
 * brand/ fica fora do git; rode este script na máquina que tem os originais:
 *   node scripts/otimizar-marca.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const HM = 'brand/hugo-martins';
const LUMI = 'brand/lumi';
const NAVY = '#000523';

if (!existsSync(HM) || !existsSync(LUMI)) {
  console.error('Originais de marca não encontrados em brand/ (a pasta fica fora do git).');
  process.exit(1);
}
mkdirSync('public/brand', { recursive: true });
mkdirSync('public/img', { recursive: true });

const webp = (origem, destino, largura, qualidade = 90) =>
  sharp(origem)
    .resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: qualidade, alphaQuality: 100 })
    .toFile(destino);

const tarefas = [
  // Cabeçalho: logo horizontal colorido (variação oficial do pacote). 2x de ~240 px.
  webp(
    `${HM}/LOGOPRINCIPAL_SEMFUNDO_VARIAÇÃO.png`,
    'public/brand/hugo-martins-horizontal.webp',
    480,
  ),
  webp(
    `${HM}/LOGO_BRANCA_SEMFUNDO_VARIAÇÃO.png`,
    'public/brand/hugo-martins-horizontal-branco.webp',
    480,
  ),
  // Logo principal empilhado (rodapé, imprensa).
  webp(`${HM}/LOGOPRINCIPAL_SEMFUNDO.png`, 'public/brand/hugo-martins-principal.webp', 640),
  // Submarca (o cérebro): menu móvel e espaços pequenos.
  webp(`${HM}/SUBMARCA_PRINCIPAL_SEMFUNDO.png`, 'public/brand/hugo-martins-submarca.webp', 160),
];

// Favicons a partir da submarca, centralizada sobre o navy da marca.
for (const [tamanho, destino] of [
  [32, 'public/favicon-32.png'],
  [180, 'public/apple-touch-icon.png'],
  [512, 'public/icon-512.png'],
]) {
  const interno = Math.round(tamanho * 0.82);
  tarefas.push(
    sharp(`${HM}/SUBMARCA_PRINCIPAL_SEMFUNDO.png`)
      .resize({
        width: interno,
        height: interno,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer()
      .then((b) =>
        sharp({ create: { width: tamanho, height: tamanho, channels: 4, background: NAVY } })
          .composite([{ input: b, gravity: 'center' }])
          .png()
          .toFile(destino),
      ),
  );
}

await Promise.all(tarefas);

// Lumi: SVGs originais, só com nome sem acento e sem o comentário do gerador.
for (const [variante, destino] of [
  ['Normal', 'lumi.svg'],
  ['Branco', 'lumi-branco.svg'],
  ['Preto', 'lumi-preto.svg'],
]) {
  const svg = readFileSync(
    `${LUMI}/Lumi Soluções integradas - ${variante} SVG.svg`,
    'utf8',
  ).replace(/<!--[\s\S]*?-->\s*/g, '');
  writeFileSync(`public/brand/${destino}`, svg);
}

console.log('✓ Arquivos de marca gerados em public/.');
