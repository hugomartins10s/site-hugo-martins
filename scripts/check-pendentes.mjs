#!/usr/bin/env node
/**
 * Trava contra conteúdo inventado ou pendente (spec 6.3).
 *
 * Procura [?], [PENDENTE], TODO e lorem nos arquivos de texto das pastas indicadas.
 * Qualquer ocorrência encerra com código 1 e quebra o build de produção.
 *
 *   node scripts/check-pendentes.mjs src/content src/data   (prebuild: fonte)
 *   node scripts/check-pendentes.mjs dist                   (postbuild: o que vai ao ar)
 *   node scripts/check-pendentes.mjs --aviso dist           (homologação: lista, mas não quebra)
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const EXTENSOES = new Set([
  '.md',
  '.mdx',
  '.json',
  '.yml',
  '.yaml',
  '.html',
  '.txt',
  '.xml',
  '.js',
  '.svg',
]);

const MARCADORES = [
  { nome: '[?]', regex: /\[\?\]/ },
  { nome: '[PENDENTE]', regex: /\[pendente\]/i },
  { nome: 'TODO', regex: /\bTODO\b/ },
  { nome: 'lorem', regex: /\blorem\b/i },
];

const args = process.argv.slice(2);
const modoAviso = args.includes('--aviso');
const pastas = args.filter((a) => !a.startsWith('--'));

if (pastas.length === 0) {
  console.error('Uso: node scripts/check-pendentes.mjs [--aviso] <pasta> [pasta…]');
  process.exit(2);
}

function* arquivos(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) yield* arquivos(caminho);
    else if (EXTENSOES.has(extname(nome).toLowerCase())) yield caminho;
  }
}

const ocorrencias = [];
for (const pasta of pastas) {
  if (!existsSync(pasta)) continue;
  for (const arquivo of arquivos(pasta)) {
    readFileSync(arquivo, 'utf8')
      .split('\n')
      .forEach((linha, i) => {
        for (const { nome, regex } of MARCADORES) {
          if (regex.test(linha))
            ocorrencias.push(`${relative(process.cwd(), arquivo)}:${i + 1}  ${nome}`);
        }
      });
  }
}

if (ocorrencias.length === 0) {
  console.log(`✓ Trava de pendências: nada pendente em ${pastas.join(', ')}.`);
  process.exit(0);
}

const titulo = `${ocorrencias.length} ocorrência(s) de conteúdo pendente em ${pastas.join(', ')}:`;
if (modoAviso) {
  console.warn(
    `⚠ Homologação: ${titulo}\n  ${ocorrencias.join('\n  ')}\n  (em produção isto quebraria o build)`,
  );
  process.exit(0);
}
console.error(`✗ Trava de pendências (spec 6.3): ${titulo}\n  ${ocorrencias.join('\n  ')}`);
console.error('Resolva os itens em docs/PENDENCIAS.md ou deixe o bloco sem renderizar.');
process.exit(1);
