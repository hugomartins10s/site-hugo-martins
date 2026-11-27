/**
 * As três formações da frente pessoal, para as seções da Home (D58). Cada resumo é tirado da
 * chamada ou do resumo do próprio produto (src/content/produtos/pessoal/*.md), sem as frases de
 * "quem contrata" e de ordem obrigatória, que ficam nas páginas de cada formação (D52).
 * Mudou o texto do produto, revise aqui.
 */

export type Imagem = {
  /** Caminho base em /public/img, sem a largura: `${base}-800.webp` e `${base}-1400.webp`. */
  base: string;
  largura: number;
  altura: number;
  alt: string;
};

export type Formacao = {
  nome: string;
  href: string;
  resumo: string;
  /** Imagem que apoia o que é a formação (D59), enviada pelo Jonathan. */
  imagem?: Imagem;
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
    imagem: {
      base: '/img/formacao-10s',
      largura: 1400,
      altura: 939,
      alt: 'Um homem de luvas limpa um terreno cheio de entulho, pneus e sacos de lixo, ao lado de um muro de pedra',
    },
  },
  {
    nome: 'Potencial Humano',
    href: '/para-voce/potencial-humano/',
    resumo:
      'Aplica o trabalho à vida pessoal e social: casa, família, igreja e convívio. É onde o lado transpessoal do trabalho ganha corpo.',
    fonte: 'Chamada e resumo do Potencial Humano (produtos/pessoal/potencial-humano.md)',
    imagem: {
      base: '/img/formacao-potencial-humano',
      largura: 1400,
      altura: 939,
      alt: 'O mesmo homem prepara o terreno já limpo, com terra adubada, sacos de adubo e bandejas de mudas prontas para plantar',
    },
  },
  {
    nome: 'Potencial Corporativo',
    href: '/para-voce/potencial-corporativo/',
    resumo:
      'Aplica o trabalho à vida profissional: relações na empresa, dinâmicas de poder, escolha da área certa, ajustes de carreira e gestão de time.',
    fonte: 'Chamada e resumo do Potencial Corporativo (produtos/pessoal/potencial-corporativo.md)',
    imagem: {
      base: '/img/formacao-potencial-corporativo',
      largura: 1400,
      altura: 939,
      alt: 'Um grupo de pessoas trabalha junto numa horta já crescida, colhendo e conversando ao lado de um muro de pedra',
    },
  },
];
