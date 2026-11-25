/**
 * Tipos de JSON-LD proibidos (spec 8). Arquivo sem dependências, lido também por
 * scripts/check-seo.mjs. LocalBusiness só entra com endereço confirmado e atendimento presencial
 * (P03); até lá, proibido.
 */
export const tiposProibidos = [
  'FAQPage',
  'Review',
  'AggregateRating',
  'MedicalBusiness',
  'MedicalOrganization',
  'MedicalClinic',
  'Physician',
  'MedicalTherapy',
  'LocalBusiness',
];
