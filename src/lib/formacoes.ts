/**
 * As três formações da frente pessoal, para os cards da Home (D58, D60). Os resumos são o texto
 * que o Jonathan enviou em 27/11/2026, palavra por palavra (D61). Não parafrasear.
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
      'No 10S, a pessoa solta o que vinha carregando e passa a enxergar a própria história com clareza. Entende por que sente e reage como reage e situa o momento de vida em que está. Sai mais leve, com o terreno limpo e bem adubado para plantar o que quiser.',
    fonte: 'Texto do Jonathan, 27/11/2026 (D61)',
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
      'O Potencial Humano leva o autoconhecimento para dentro de casa e do convívio. A pessoa passa a entender quem vive ao seu lado, a se comunicar com mais verdade e a ocupar o seu lugar na família, na igreja e nas amizades. O lado transpessoal ganha corpo no cotidiano.',
    fonte: 'Texto do Jonathan, 27/11/2026 (D61)',
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
      'O Potencial Corporativo leva o autoconhecimento para o trabalho. A pessoa aprende a ler as relações e as dinâmicas de poder da empresa, descobre se está na área certa, ajusta a carreira com consciência e conduz o time com mais segurança. Assim, a vida profissional ganha clareza, propósito e direção.',
    fonte: 'Texto do Jonathan, 27/11/2026 (D61)',
    imagem: {
      base: '/img/formacao-potencial-corporativo',
      largura: 1400,
      altura: 939,
      alt: 'Um grupo de pessoas trabalha junto numa horta já crescida, colhendo e conversando ao lado de um muro de pedra',
    },
  },
];
