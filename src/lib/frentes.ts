/**
 * As duas frentes (spec 3.1), com os textos [C] de "quem compra". Fonte única para o menu, a
 * Home, a página do Hugo e o rodapé. Os produtos de cada frente vêm da navegação.
 */
import navegacao from '../data/navegacao.json';
import { empresa } from './empresa';

const [paraVoce, paraEmpresas] = navegacao.principal;

export const frentes = [
  {
    id: 'pessoal' as const,
    item: paraVoce!,
    marca: empresa.marcas.pessoal.nome,
    quem: 'Quem compra é a pessoa.',
    lumi: false,
  },
  {
    id: 'empresas' as const,
    item: paraEmpresas!,
    marca: empresa.marcas.empresas.nome,
    quem: 'Quem compra é a empresa. A Lumi fatura os contratos.',
    lumi: true,
  },
];

export type Frente = (typeof frentes)[number];

/** A frente de um item da navegação principal, se for uma das duas. */
export const frenteDoItem = (href: string) => frentes.find((f) => f.item.href === href);
