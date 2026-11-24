// @ts-check
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';

// .env não é carregado automaticamente no arquivo de configuração (docs Astro).
const env = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };

// SITE_URL definitivo depende do domínio (docs/PENDENCIAS.md P19/P28).
const site = env.SITE_URL || 'http://localhost:4321';
// BASE_PATH só é usado na homologação do GitHub Pages (/site-hugo-martins).
const base = env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  env: {
    schema: {
      HOMOLOGACAO: envField.boolean({ context: 'server', access: 'public', default: false }),
    },
  },
});
