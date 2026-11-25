/**
 * Integração Astro: depois do build, gera uma imagem OG por página (dist/og/<rota>.png).
 * O texto é o h1 da página; a marca vem do data-brand do <html> (Lumi em /para-empresas/).
 * O caminho de cada imagem é o mesmo que o <Head> calcula (src/lib/seo.ts → arquivoOg).
 * Imports com .ts: este arquivo também roda direto no Node (astro.config e testes).
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { arquivoOg } from '../seo.ts';
import { gerarOg } from './imagem.ts';

const entidades: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Texto do primeiro h1, sem tags e com entidades decodificadas. */
export function textoH1(html: string): string | null {
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1) return null;
  return h1[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, c: string) =>
      c[0] === '#'
        ? String.fromCodePoint(c[1] === 'x' ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10))
        : (entidades[c.toLowerCase()] ?? m),
    )
    .replace(/\s+/g, ' ')
    .trim();
}

/** "index.html" → "/", "para-voce/10s/index.html" → "/para-voce/10s/", "404.html" → "/404". */
export function rotaDoArquivo(rel: string): string {
  const r = rel.split('\\').join('/');
  if (r === 'index.html') return '/';
  if (r.endsWith('/index.html')) return `/${r.slice(0, -'index.html'.length)}`;
  return `/${r.replace(/\.html$/, '')}`;
}

async function htmls(pasta: string): Promise<string[]> {
  const itens = await readdir(pasta, { withFileTypes: true, recursive: true });
  return itens
    .filter((i) => i.isFile() && i.name.endsWith('.html'))
    .map((i) => join(i.parentPath, i.name));
}

export default function ogImagens(): AstroIntegration {
  let publico = '';
  return {
    name: 'og-imagens',
    hooks: {
      'astro:config:done': ({ config }) => {
        publico = fileURLToPath(config.publicDir);
      },
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        const arquivos = await htmls(raiz);
        for (const arquivo of arquivos) {
          const html = await readFile(arquivo, 'utf8');
          const titulo = textoH1(html);
          if (!titulo) {
            logger.warn(`sem h1, sem imagem OG: ${relative(raiz, arquivo)}`);
            continue;
          }
          const marca = /<html\b[^>]*data-brand="lumi"/.test(html) ? 'lumi' : 'hugo';
          const destino = join(raiz, arquivoOg(rotaDoArquivo(relative(raiz, arquivo))));
          await mkdir(dirname(destino), { recursive: true });
          await writeFile(destino, await gerarOg(titulo, marca, publico));
        }
        logger.info(`${arquivos.length} imagens OG geradas em og/`);
      },
    },
  };
}
