/**
 * Conceitos do Método (spec 4.4): caminhos, ordem e as ligações exigidas pela spec 4.3.
 * A única fonte da ligação conceito ↔ produto é `produtosRelacionados`, no arquivo do conceito.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Conceito = CollectionEntry<'conceitos'>;

export const caminhoDoConceito = (c: Conceito | string) =>
  `/metodo/${typeof c === 'string' ? c : c.id}/`;

/** Todos os conceitos na ordem da tabela da spec 4.4. */
export async function conceitosOrdenados(): Promise<Conceito[]> {
  return (await getCollection('conceitos')).sort((a, b) => a.data.ordem - b.data.ordem);
}

/** Conceitos trabalhados num produto: o caminho inverso de `produtosRelacionados`. */
export async function conceitosDoProduto(produtoId: string): Promise<Conceito[]> {
  return (await conceitosOrdenados()).filter((c) =>
    c.data.produtosRelacionados.some((p) => p.id === produtoId),
  );
}

/**
 * Conceitos vizinhos (spec 4.3): primeiro os do mesmo tema, depois os que dividem mais produtos;
 * empate fica na ordem do Método. Até `quantos`.
 */
export function vizinhos(conceito: Conceito, todos: Conceito[], quantos = 3): Conceito[] {
  const meus = new Set(conceito.data.produtosRelacionados.map((p) => p.id));
  const peso = (c: Conceito) =>
    (c.data.tema.id === conceito.data.tema.id ? 100 : 0) +
    c.data.produtosRelacionados.filter((p) => meus.has(p.id)).length;
  return todos
    .filter((c) => c.id !== conceito.id)
    .map((c) => ({ c, peso: peso(c) }))
    .sort((a, b) => b.peso - a.peso || a.c.data.ordem - b.c.data.ordem)
    .slice(0, quantos)
    .map(({ c }) => c);
}
