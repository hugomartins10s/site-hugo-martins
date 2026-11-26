/**
 * Frases-assinatura do Hugo, palavra por palavra, usadas como chamadas visuais (D51). Não são
 * cópia nova sobre o método (spec 6.3): são citações do próprio Hugo, registradas nos dois
 * manuais que o Jonathan entregou em 26/11/2026 (em `conteudo-bruto/`, fora do repositório).
 * Revisão do Hugo: P38. Mudou a redação lá, mude aqui; não parafrasear.
 */

export type Frase = {
  texto: string;
  /** De onde saiu, para a revisão (P38). */
  fonte: string;
};

export const frases = {
  /** Assinatura. Manual de identidade verbal, seções 2 e 4; manual de conhecimento autoral, 1. */
  almaCorpo: {
    texto: 'A Alma fala, o Corpo traduz!',
    fonte: 'Manual de identidade verbal, 2 e 4 (Assinaturas)',
  },
  /** Manual de identidade verbal, 1 (pilar "Integrador Sistêmico-Holístico"). */
  biologia: {
    texto: 'Antes de fazer filosofia, escute a biologia, tem muito mais sabedoria!',
    fonte: 'Manual de identidade verbal, 1 (Integrador Sistêmico-Holístico)',
  },
  /** Manual de identidade verbal, 1 (pilar "Didático-Instrutivo e Metódico"). */
  destino: {
    texto:
      'Pensamento gera emoção, emoção gera comportamento, comportamento gera caráter e caráter gera seu destino!',
    fonte: 'Manual de identidade verbal, 1 (Didático-Instrutivo e Metódico)',
  },
} satisfies Record<string, Frase>;

/** A cadeia da frase `destino`, para o desenho em setas (o texto inteiro também vai no HTML). */
export const cadeiaDoDestino = ['Pensamento', 'Emoção', 'Comportamento', 'Caráter', 'Destino'];
