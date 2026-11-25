/**
 * JSON-LD (spec 8): um grafo por página, com @id estáveis reaproveitados.
 * Tudo vem de empresa.json e do front matter; campo sem dado [C] fica de fora.
 *
 * Proibido (spec 8): FAQPage, Review, AggregateRating, MedicalBusiness, Physician,
 * MedicalTherapy ou qualquer tipo médico; LocalBusiness só com endereço confirmado e
 * atendimento presencial. A lista fica em ./proibidos.ts e é verificada em scripts/check-seo.mjs.
 */
import { empresa } from '../empresa';

export type No = Record<string, unknown>;
export type ItemTrilha = { nome: string; href: string };

export { tiposProibidos } from './proibidos';

/** @id estáveis, ancorados na URL da página inicial. */
export function ids(inicio: string) {
  return {
    site: `${inicio}#website`,
    org: `${inicio}#org`,
    hugo: `${inicio}#hugo`,
    lumi: `${inicio}#lumi`,
    livro: `${inicio}#livro`,
  };
}

export function noSite(inicio: string): No {
  return {
    '@type': 'WebSite',
    '@id': ids(inicio).site,
    url: inicio,
    name: empresa.nome,
    inLanguage: 'pt-BR',
    publisher: { '@id': ids(inicio).org },
  };
}

export function noOrganizacao(inicio: string): No {
  const { contato, endereco } = empresa;
  return {
    '@type': 'Organization',
    '@id': ids(inicio).org,
    name: empresa.nome,
    alternateName: empresa.nomeCurto,
    url: inicio,
    logo: {
      '@type': 'ImageObject',
      url: new URL('brand/hugo-martins-principal.webp', inicio).href,
      width: 640,
      height: 328,
    },
    founder: { '@id': ids(inicio).hugo },
    sameAs: empresa.redes.map((r) => r.url),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      telephone: contato.whatsapp,
      email: contato.email,
      availableLanguage: 'pt-BR',
    },
    ...(empresa.razaoSocial && { legalName: empresa.razaoSocial }),
    ...(empresa.cnpj && { taxID: empresa.cnpj }),
    ...(endereco && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: endereco.logradouro,
        addressLocality: endereco.cidade,
        addressRegion: endereco.uf,
        postalCode: endereco.cep,
        addressCountry: 'BR',
      },
    }),
  };
}

export function noPagina(
  inicio: string,
  url: string,
  nome: string,
  descricao: string,
  temTrilha: boolean,
  tipo = 'WebPage',
  principal?: string,
): No {
  return {
    '@type': tipo,
    '@id': `${url}#pagina`,
    url,
    name: nome,
    description: descricao,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': ids(inicio).site },
    ...(temTrilha && { breadcrumb: { '@id': `${url}#trilha` } }),
    ...(principal && { mainEntity: { '@id': principal } }),
  };
}

/** Hugo (`#hugo`): nó completo só em /hugo-martins/ (spec 8). Foto entra com a P08. */
export function noPessoa(inicio: string, paginaHugo: string): No {
  const { pessoa } = empresa;
  return {
    '@type': 'Person',
    '@id': ids(inicio).hugo,
    name: pessoa.nome,
    alternateName: pessoa.nomeCompleto,
    jobTitle: pessoa.atuacao,
    description: pessoa.descricao,
    knowsAbout: pessoa.areas,
    worksFor: { '@id': ids(inicio).org },
    url: paginaHugo,
    sameAs: empresa.redes.map((r) => r.url),
  };
}

/** Lumi (`#lumi`): frente empresarial do grupo, nas páginas /para-empresas/ (spec 8). */
export function noLumi(inicio: string, paginaLumi: string): No {
  return {
    '@type': 'Organization',
    '@id': ids(inicio).lumi,
    name: empresa.marcas.empresas.nome,
    url: paginaLumi,
    logo: {
      '@type': 'ImageObject',
      url: new URL('brand/lumi.svg', inicio).href,
    },
    parentOrganization: { '@id': ids(inicio).org },
  };
}

/** Produto como `Service`, sem `offers` nem preço enquanto forem [?] (spec 8). */
export function noServico(
  inicio: string,
  url: string,
  produto: { nome: string; descricao: string; frente: 'pessoal' | 'empresas' },
): No {
  const pessoal = produto.frente === 'pessoal';
  return {
    '@type': 'Service',
    '@id': `${url}#servico`,
    name: produto.nome,
    description: produto.descricao,
    url,
    provider: { '@id': pessoal ? ids(inicio).org : ids(inicio).lumi },
    serviceType: pessoal ? 'Desenvolvimento de Potencial Humano' : 'Treinamento para empresas',
    audience: pessoal
      ? { '@type': 'Audience', audienceType: 'Pessoas' }
      : { '@type': 'BusinessAudience', audienceType: 'Empresas' },
  };
}

/**
 * O livro (`#livro`). O e-ISBN é da edição digital, então vai num `workExample` com
 * bookFormat EBook, e o nó principal representa a obra. Idioma: português (sem fixar a variante).
 */
export function noLivro(inicio: string, paginaLivro: string, descricao: string): No {
  const { livro } = empresa;
  return {
    '@type': 'Book',
    '@id': ids(inicio).livro,
    name: livro.titulo,
    description: descricao,
    url: paginaLivro,
    author: { '@id': ids(inicio).hugo },
    publisher: { '@type': 'Organization', name: livro.editora },
    inLanguage: 'pt',
    workExample: {
      '@type': 'Book',
      bookFormat: 'https://schema.org/EBook',
      isbn: livro.isbnEbook,
    },
  };
}

/** Trilha completa, com "Início" na frente e a página atual no fim. */
export function noTrilha(url: string, itens: ItemTrilha[], site: URL | string): No {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#trilha`,
    itemListElement: itens.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.nome,
      item: new URL(item.href, site).href,
    })),
  };
}

/** Serializa para <script type="application/ld+json">, sem permitir fechar a tag. */
export function serializar(grafo: No[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }).replace(
    /</g,
    '\\u003c',
  );
}
