/** Páginas avulsas (coleção `paginas`): busca pelo id e falha no build se o arquivo faltar. */
import { getEntry, type CollectionEntry } from 'astro:content';

export type Pagina = CollectionEntry<'paginas'>;

export async function pagina(id: string): Promise<Pagina> {
  const entrada = await getEntry('paginas', id);
  if (!entrada) throw new Error(`Falta src/content/paginas/${id}.md`);
  return entrada;
}

export const tituloSeo = (p: Pagina) => p.data.tituloSeo ?? `${p.data.titulo} · Hugo Martins`;
