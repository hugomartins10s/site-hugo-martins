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
import { pendente } from './lib/pendente';

/** O id da entrada é o nome do arquivo, sem a subpasta (ex.: produtos/pessoal/10s.md → "10s"). */
const idPeloNomeDoArquivo = ({ entry }: { entry: string }) =>
  entry.replace(/^.*\//, '').replace(/\.(md|mdx)$/, '');

const palavras = (texto: string) => texto.trim().split(/\s+/).filter(Boolean).length;

const resumo = z.string().refine((t) => pendente(t) || (palavras(t) >= 40 && palavras(t) <= 80), {
  message: 'O parágrafo-resposta (`resumo`) precisa ter de 40 a 80 palavras (spec 5).',
});

const perguntaResposta = z.object({ pergunta: z.string(), resposta: z.string() });

/** Linha da ficha "Em resumo" (spec 5). Só fatos [C]; o que é [?] fica fora do arquivo. */
const fato = z.object({ rotulo: z.string(), valor: z.string() });

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
    /** Frase curta do cartão (hub e Home): o texto [C] da tabela da spec 3.1. */
    chamada: z.string().optional(),
    fatos: z.array(fato).default([]),
    prerequisito: reference('produtos').optional(),
    publico: z.string().optional(),
    formato: z.string().optional(),
    duracao: z.string().optional(),
    preco: z.string().optional(),
    faq: z.array(perguntaResposta).default([]),
    atualizado: z.coerce.date(),
  }),
});

// Conceitos do Método (spec 4.4 e 5.7). A ligação conceito → produto mora só aqui
// (`produtosRelacionados`); a página de produto lista os conceitos pelo caminho inverso.
// Os vizinhos saem do tema e dos produtos em comum (src/lib/conceitos.ts).
const conceitos = defineCollection({
  loader: glob({ base: './src/content/conceitos', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    titulo: z.string(),
    tituloSeo: z.string().max(70).optional(),
    /** Pergunta-alvo da spec 4.4: texto do cartão no hub e na Home. */
    pergunta: z.string(),
    resumo,
    tema: reference('temas'),
    /** Ordem da tabela da spec 4.4; a Home destaca os 4 primeiros do lote 1. */
    ordem: z.number().int().positive(),
    /** Arquivos do acervo de onde o texto sai. Interno: não aparece na página. */
    fontesAcervo: z.array(z.string()).min(1),
    produtosRelacionados: z
      .array(reference('produtos'))
      .min(1, 'Todo conceito linka os produtos onde é trabalhado (spec 4.3).'),
    /** Liga o conceito ao livro nas leituras relacionadas (ex.: Reiki da Alma). */
    livro: z.boolean().default(false),
    lote: z.union([z.literal(1), z.literal(2)]),
    fatos: z.array(fato).default([]),
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

// Páginas avulsas (Home, hubs, Hugo Martins, livro, contato, FAQ, imprensa, legais). As legais não
// respondem a uma pergunta: o `resumo` delas é a descrição da página e pode ter menos de 40 palavras.
const paginas = defineCollection({
  loader: glob({ base: './src/content/paginas', pattern: '**/*.{md,mdx}' }),
  schema: z
    .object({
      titulo: z.string(),
      tituloSeo: z.string().max(70).optional(),
      pergunta: z.string().optional(),
      resumo: z.string(),
      legal: z.boolean().default(false),
      fatos: z.array(fato).default([]),
      /** Links externos verificados (ex.: onde comprar o livro, P21). Vazio = bloco oculto. */
      lojas: z.array(z.object({ nome: z.string(), url: z.url() })).default([]),
      faq: z.array(perguntaResposta).default([]),
      atualizado: z.coerce.date(),
    })
    .refine(
      (p) =>
        p.legal || pendente(p.resumo) || (palavras(p.resumo) >= 40 && palavras(p.resumo) <= 80),
      {
        message: 'O parágrafo-resposta (`resumo`) precisa ter de 40 a 80 palavras (spec 5).',
        path: ['resumo'],
      },
    )
    .refine((p) => palavras(p.resumo) <= 80, {
      message: 'O `resumo` passa de 80 palavras.',
      path: ['resumo'],
    }),
});

export const collections = { temas, produtos, conceitos, posts, faq, paginas };
