/**
 * As três formações da frente pessoal, para as seções da Home (D58). Cada resumo é tirado da
 * chamada ou do resumo do próprio produto (src/content/produtos/pessoal/*.md), sem as frases de
 * "quem contrata" e de ordem obrigatória, que ficam nas páginas de cada formação (D52).
 * Mudou o texto do produto, revise aqui.
 */

export type Formacao = {
  nome: string;
  href: string;
  resumo: string;
  /** De onde saiu, para a revisão. */
  fonte: string;
};

export const formacoes: Formacao[] = [
  {
    nome: '10S',
    href: '/para-voce/10s/',
    resumo:
      'Dez sessões individuais para expurgar o que pesa, se entender e situar o momento de vida. Hugo compara o processo a limpar e adubar o terreno antes de plantar o jardim.',
    fonte: 'Chamada e resumo do 10S (produtos/pessoal/10s.md)',
  },
  {
    nome: 'Potencial Humano',
    href: '/para-voce/potencial-humano/',
    resumo:
      'Aplica o trabalho à vida pessoal e social: casa, família, igreja e convívio. É onde o lado transpessoal do trabalho ganha corpo.',
    fonte: 'Chamada e resumo do Potencial Humano (produtos/pessoal/potencial-humano.md)',
  },
  {
    nome: 'Potencial Corporativo',
    href: '/para-voce/potencial-corporativo/',
    resumo:
      'Aplica o trabalho à vida profissional: relações na empresa, dinâmicas de poder, escolha da área certa, ajustes de carreira e gestão de time.',
    fonte: 'Chamada e resumo do Potencial Corporativo (produtos/pessoal/potencial-corporativo.md)',
  },
];
