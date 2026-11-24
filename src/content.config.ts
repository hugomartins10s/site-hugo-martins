/**
 * Coleções de conteúdo (spec 6.2). Astro 7: este arquivo fica em src/, as entradas em src/content/.
 *
 * Regras que os schemas garantem:
 * - Campos [?] (formato, preco, duracao…) são opcionais: ausentes, o bloco não renderiza (spec 6.3).
 * - `resumo` é o parágrafo-resposta: 40 a 80 palavras (spec 5). Alimenta .lead, meta description,
 *   schema e llms.txt.
 * - FAQ de produto é texto visível; nunca vira marcação FAQPage (spec 8).
 */
import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** O id da entrada é o nome do arquivo, sem a subpasta (ex.: produtos/pessoal/10s.md → "10s"). */
const idPeloNomeDoArquivo = ({ entry }: { entry: string }) =>
  entry.replace(/^.*\//, '').replace(/\.(md|mdx)$/, '');

const palavras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean).length;

const resumo = z.string().refine((t) => palavras(t) >= 40 && palavras(t) <= 80, {
  message: 'O parágrafo-resposta (`resumo`) precisa ter de 40 a 80 palavras (spec 5).',
});

const perguntaResposta = z.object({ pergunta: z.string(), resposta: z.string() });

const temas = defineCollection({
  loader: file('src/data/temas.json'),
  schema: z.object({ nome: z.string() }),
});

const produtos = defineCollection({
  loader: glob({
    base: './src/content/produtos',
    pattern: '**/*.{md,mdx}',
    generateId: idPeloNomeDoArquivo,
  }),
  schema: z.object({
    frente: z.enum(['pessoal', 'empresas']),
    ordem: z.number().int().positive(),
    titulo: z.string(),
    tituloSeo: z.string().max(70).optional(),
    pergunta: z.string(),
    resumo,
    prerequisito: reference('produtos').optional(),
    publico: z.string().optional(),
    formato: z.string().optional(),
    duracao: z.string().optional(),
    preco: z.string().optional(),
    conceitos: z.array(reference('conceitos')).default([]),
    faq: z.array(perguntaResposta).default([]),
    atualizado: z.coerce.date(),
  }),
});

const conceitos = defineCollection({
  loader: glob({ base: './src/content/conceitos', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    titulo: z.string(),
    tituloSeo: z.string().max(70).optional(),
    pergunta: z.string(),
    resumo,
    tema: reference('temas'),
    fontesAcervo: z.array(z.string()).min(1),
    produtosRelacionados: z.array(reference('produtos')).default([]),
    conceitosVizinhos: z.array(reference('conceitos')).default([]),
    lote: z.union([z.literal(1), z.literal(2)]),
    faq: z.array(perguntaResposta).default([]),
    atualizado: z.coerce.date(),
  }),
});

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      titulo: z.string(),
      tituloSeo: z.string().max(70).optional(),
      resumo,
      tema: reference('temas'),
      publicado: z.coerce.date(),
      atualizado: z.coerce.date(),
      conceitos: z
        .array(reference('conceitos'))
        .min(1, 'Todo post linka pelo menos 1 conceito (spec 4.3).'),
      produtoCta: reference('produtos'),
    })
    .refine((p) => p.atualizado >= p.publicado, {
      message: '`atualizado` não pode ser anterior a `publicado`.',
    }),
});

const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    grupo: z.enum(['Empresa', '10S', 'Esteira', 'Para empresas', 'Contato']),
    ordem: z.number().int().positive(),
    pergunta: z.string(),
    resposta: z.string(),
  }),
});

const paginas = defineCollection({
  loader: glob({ base: './src/content/paginas', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    titulo: z.string(),
    tituloSeo: z.string().max(70).optional(),
    pergunta: z.string().optional(),
    resumo,
    faq: z.array(perguntaResposta).default([]),
    atualizado: z.coerce.date(),
  }),
});

export const collections = { temas, produtos, conceitos, posts, faq, paginas };
