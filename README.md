# Site Hugo Martins – Desenvolvimento de Potencial Humano

Site institucional estático em [Astro](https://docs.astro.build/). Todo o conteúdo sai no HTML; JavaScript é só aprimoramento.

- **Homologação:** https://hugomartins10s.github.io/site-hugo-martins/ (com `noindex`; não aparece em buscadores)
- **Produção:** domínio final ainda a definir.

## Pastas

- `src/` e `public/`: o que vai ao ar.
- `scripts/`: trava de conteúdo pendente (com testes), conferência de links e de rastreadores.
- `docs/`, `brand/` e `conteudo-bruto/`: fontes internas (spec, pendências, decisões, marca original, textos brutos). Ficam só na máquina de quem desenvolve; o repositório público versiona apenas os READMEs dessas pastas.

## Como rodar

Requer Node 24 (veja `.nvmrc`; o Astro 7 exige ≥ 22.23.4).

```bash
npm install
npm run dev              # http://localhost:4321
npm run lint             # astro check + prettier
npm test                 # testes da trava de pendências
npm run build            # build de produção (falha se houver conteúdo pendente)
npm run build:homologacao  # build com noindex e robots Disallow; só lista pendências
npm run preview          # serve o dist/ gerado
```

Variáveis de ambiente: copie `.env.example` para `.env`. Em desenvolvimento nenhuma é obrigatória.

## Como publicar

- **Homologação:** todo push na `main` publica sozinho no GitHub Pages (`.github/workflows/deploy-homologacao.yml`). O CI (`ci.yml`) roda lint, testes e os dois builds.
- **Produção:** definida na fase 5 (hospedagem, domínio, formulário e analytics ainda pendentes).

## Trava de conteúdo pendente

Qualquer `[?]`, `[PENDENTE]`, `TODO` ou `lorem` em `src/content`, `src/data` ou no HTML gerado **quebra o build de produção** (spec 6.3). Para conferir sem buildar:

```bash
npm run check:pendentes
```

Campo sem dado confirmado fica **ausente** do front matter; o bloco correspondente não renderiza. Nunca escreva texto de preenchimento.

## Como adicionar um conteúdo

O formato de cada coleção está em `src/content.config.ts`; o build recusa front matter inválido e diz qual campo está errado.

**Post** em `src/content/posts/<slug>.md` (o nome do arquivo vira a URL `/blog/<slug>/`; sem data na URL):

```md
---
titulo: Como se define Propósito de Vida?
resumo: Parágrafo-resposta de 40 a 80 palavras, autossuficiente, começando pelo sujeito.
tema: direcao-de-vida # um id de src/data/temas.json
publicado: AAAA-MM-DD # data original de publicação (posts do Wix mantêm a data deles)
atualizado: AAAA-MM-DD # só muda quando o conteúdo muda
conceitos: [metodo-gps] # pelo menos 1
produtoCta: 10s
---

Corpo do post em Markdown. Termina com "Abraço de Alma".
```

**Conceito** em `src/content/conceitos/<slug>.md` (URL `/metodo/<slug>/`):

```md
---
titulo: O que é metacognição?
pergunta: O que é metacognição e o que são os 7 campos do eu observador?
resumo: Parágrafo-resposta de 40 a 80 palavras.
tema: autoconhecimento-e-metacognicao
fontesAcervo: [Metacognição proposta completa]
produtosRelacionados: [10s, potencial-humano]
conceitosVizinhos: [sombra-e-armadilhas-do-ego]
lote: 1
atualizado: 2026-11-24
---

Corpo em Markdown, escrito só a partir do acervo. Enquanto faltar texto: [PENDENTE]
```
