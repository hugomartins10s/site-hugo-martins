/**
 * O que o trabalho de Hugo Martins ajuda a resolver, para a Home (D52). A Home fala de problemas,
 * não de produto: quem compra, a esteira e os formatos ficam nas páginas de cada frente.
 *
 * Cada linha é montada com as palavras das fontes, sem acrescentar ideia nova (spec 6.3); o
 * campo `fonte` diz de onde saiu. Revisão do Hugo: P39. Mudou lá, mude aqui.
 */

export type Problema = {
  titulo: string;
  texto: string;
  /** De onde saiu, para a revisão (P39). */
  fonte: string;
};

/** Na vida da pessoa (frente pessoal: 10S, Potencial Humano, Potencial Corporativo). */
export const naVida: Problema[] = [
  {
    titulo: 'O que pesa',
    texto: 'Expurgar o que pesa, se entender e situar o momento de vida.',
    fonte: 'Chamada do 10S (produtos/pessoal/10s.md)',
  },
  {
    titulo: 'Camaleões sociais',
    texto: 'Mudar de cor, opinião e personalidade conforme o ambiente, para garantir aprovação.',
    fonte: 'Manual de conhecimento autoral, 3 (Os Camaleões Sociais)',
  },
  {
    titulo: 'Casa, família e convívio',
    texto: 'A vida pessoal e social, onde o lado transpessoal do trabalho ganha corpo.',
    fonte: 'Chamada do Potencial Humano (produtos/pessoal/potencial-humano.md)',
  },
  {
    titulo: 'Sua carreira',
    texto: 'Relações na empresa, dinâmicas de poder, área certa, ajustes de carreira.',
    fonte: 'Chamada do Potencial Corporativo (produtos/pessoal/potencial-corporativo.md)',
  },
];

/** Na empresa (frente Lumi). */
export const naEmpresa: Problema[] = [
  {
    titulo: 'Jogos de poder',
    texto:
      'O Cobrador, o Lamentoso, o Adulador, o Inquiridor: perfis que drenam a energia de quem está em volta.',
    fonte: 'Manual de identidade verbal, 3 (Vampirismo Energético e Jogos de Poder)',
  },
  {
    titulo: 'O que o corpo diz',
    texto: 'O corpo sempre denuncia a mentira por incongruência.',
    fonte: 'Manual de conhecimento autoral, 1 (Inviabilidade do Fingimento Cinésico)',
  },
  {
    titulo: 'Equipes e liderança',
    texto: 'Equipes de alta performance e liderança de alta performance.',
    fonte: 'Nomes dos treinamentos da Lumi (spec 3.1)',
  },
];
