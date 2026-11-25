/**
 * Monta a trilha (breadcrumb) de uma página interna: "Início" + os níveis + a página atual.
 * Os hrefs já saem com o base (url()), prontos para o <Breadcrumb> e para o JSON-LD.
 */
import type { ItemTrilha } from './schema/grafo';
import { url } from './links';

export function trilha(...niveis: [nome: string, caminho: string][]): ItemTrilha[] {
  return [['Início', '/'] as [string, string], ...niveis].map(([nome, caminho]) => ({
    nome,
    href: url(caminho),
  }));
}
