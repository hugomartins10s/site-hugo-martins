/**
 * Blog (spec 4.5): caminhos, ordem e temas. Datas de publicação sempre as originais.
 * URL sem data: /blog/[slug]/; arquivo por tema em /blog/tema/[tema]/; lista paginada em
 * /blog/ e /blog/pagina/2/ (o prefixo evita colisão com o slug de um post).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import ordemDosTemas from '../data/temas.json';

export type Post = CollectionEntry<'posts'>;
export type Tema = CollectionEntry<'temas'>;

export const POSTS_POR_PAGINA = 12;

export const caminhoDoPost = (p: Post) => `/blog/${p.id}/`;
export const caminhoDoTema = (tema: string) => `/blog/tema/${tema}/`;
export const caminhoDaPagina = (n: number) => (n <= 1 ? '/blog/' : `/blog/pagina/${n}/`);

/** Posts do mais novo para o mais antigo. */
export async function postsOrdenados(filtro?: (p: Post) => boolean): Promise<Post[]> {
  const lista = await getCollection('posts', filtro);
  return lista.sort(
    (a, b) =>
      b.data.publicado.getTime() - a.data.publicado.getTime() || a.id.localeCompare(b.id, 'pt'),
  );
}

/** Temas na ordem de src/data/temas.json, com os posts de cada um. */
export async function temasComPosts(): Promise<{ tema: Tema; posts: Post[] }[]> {
  const [temas, posts] = await Promise.all([getCollection('temas'), postsOrdenados()]);
  const posicao = (t: Tema) => ordemDosTemas.findIndex((x) => x.id === t.id);
  return temas
    .sort((a, b) => posicao(a) - posicao(b))
    .map((tema) => ({ tema, posts: posts.filter((p) => p.data.tema.id === tema.id) }));
}

/** Divide a lista em páginas; sempre há pelo menos uma (a /blog/ existe mesmo sem posts). */
export function paginas<T>(itens: T[], porPagina = POSTS_POR_PAGINA): T[][] {
  const total = Math.max(1, Math.ceil(itens.length / porPagina));
  return Array.from({ length: total }, (_, i) => itens.slice(i * porPagina, (i + 1) * porPagina));
}
