/**
 * Linhas da tabela comparativa (spec 7.1) a partir das fichas dos produtos. Só entram os rótulos
 * que todos os produtos têm, na ordem do primeiro: uma linha com buraco daria a entender um dado
 * que não existe. Formato, duração e preço entram quando estiverem nos três.
 */
import type { Produto } from './produtos';

export function linhasComparativas(produtos: Produto[]) {
  const ficha = (p: Produto) => {
    const d = p.data;
    return new Map([
      ...d.fatos.map((f) => [f.rotulo, f.valor] as const),
      ...(d.formato ? [['Formato', d.formato] as const] : []),
      ...(d.duracao ? [['Duração', d.duracao] as const] : []),
      ...(d.preco ? [['Investimento', d.preco] as const] : []),
    ]);
  };
  const fichas = produtos.map(ficha);
  const rotulos = [...(fichas[0]?.keys() ?? [])].filter((r) => fichas.every((f) => f.has(r)));
  return rotulos.map((rotulo) => ({ rotulo, valores: fichas.map((f) => f.get(rotulo)!) }));
}
