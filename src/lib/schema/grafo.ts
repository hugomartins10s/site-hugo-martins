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
