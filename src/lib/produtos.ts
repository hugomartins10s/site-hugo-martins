/**
 * Produtos das duas frentes (spec 3.1): caminhos, ordem e o hub de cada frente.
 * O caminho vem da frente + id do arquivo (produtos/pessoal/10s.md → /para-voce/10s/).
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Produto = CollectionEntry<'produtos'>;
export type Frente = Produto['data']['frente'];

export const hubs = {
  pessoal: { nome: 'Para você', caminho: '/para-voce/' },
  empresas: { nome: 'Para empresas', caminho: '/para-empresas/' },
} as const;

export const caminhoDoProduto = (p: Produto) => `${hubs[p.data.frente].caminho}${p.id}/`;

export async function produtosDaFrente(frente: Frente): Promise<Produto[]> {
  const lista = await getCollection('produtos', (p) => p.data.frente === frente);
  return lista.sort((a, b) => a.data.ordem - b.data.ordem);
}
