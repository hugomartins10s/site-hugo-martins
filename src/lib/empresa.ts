/**
 * Única fonte de contatos, redes, sameAs e dados cadastrais (spec 6.2).
 * Só entram dados [C]. Campos [?] ficam ausentes e o bloco correspondente não renderiza:
 *   - endereco  → P03 (cidade-base e endereço)
 *   - cnpj / razaoSocial → P06
 *   - slogan    → P33 (só aparece na página Holos do manual)
 */
import { z } from 'astro/zod';
import dados from '../data/empresa.json';

const marca = z.object({
  nome: z.string(),
  publico: z.enum(['pessoa', 'empresa']),
  caminho: z.string().startsWith('/'),
});

const schema = z
  .object({
    nome: z.string(),
    nomeCurto: z.string(),
    assinatura: z.string(),
    slogan: z.string().optional(),
    marcas: z.object({ pessoal: marca, empresas: marca }),
    pessoa: z.object({
      nome: z.string(),
      nomeCompleto: z.string(),
      atuacao: z.string(),
      descricao: z.string(),
      areas: z.array(z.string()).min(1),
      criacoes: z.array(z.string()).min(1),
      comecouPor: z.string(),
      cidadeBase: z.string().optional(),
      atuaDesde: z.number().int().optional(),
    }),
    livro: z.object({
      titulo: z.string(),
      editora: z.string(),
      isbnEbook: z.string(),
      caminho: z.string().startsWith('/'),
    }),
    contato: z.object({
      whatsapp: z.string().regex(/^\+\d{12,13}$/),
      whatsappExibicao: z.string(),
      email: z.email(),
    }),
    redes: z.array(z.object({ rede: z.string(), usuario: z.string(), url: z.url() })),
    endereco: z
      .object({
        logradouro: z.string(),
        bairro: z.string(),
        cidade: z.string(),
        uf: z.string().length(2),
        cep: z.string(),
      })
      .optional(),
    cnpj: z.string().optional(),
    razaoSocial: z.string().optional(),
  })
  .strict();

export const empresa = schema.parse(dados);
export type Empresa = z.infer<typeof schema>;

/** Link de WhatsApp com mensagem pré-preenchida opcional. */
export function linkWhatsApp(mensagem?: string): string {
  const numero = empresa.contato.whatsapp.replace('+', '');
  return mensagem
    ? `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
    : `https://wa.me/${numero}`;
}
