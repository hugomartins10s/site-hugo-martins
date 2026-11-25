/**
 * Imagem Open Graph (spec 7.1: "gerada no build com texto legível"), 1200×630.
 * Topo navy liso, logo original da marca, filete e o h1 da página em fonte grande.
 * Satori monta o SVG (texto vira contorno, com as fontes do site) e o sharp gera o PNG.
 * Satori não lê woff2 nem fontes variáveis: usa os woff estáticos dos pacotes @fontsource.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const LARGURA = 1200;
const ALTURA = 630;
const MARGEM_X = 84;
const MARGEM_TOPO = 72;
const MARGEM_BASE = 80;

type Marca = 'hugo' | 'lumi';

const fonte = (pacote: string, arquivo: string) =>
  readFile(require.resolve(`${pacote}/files/${arquivo}`));

let recursos: Promise<{
  fontes: Parameters<typeof satori>[1]['fonts'];
  logos: Record<Marca, { src: string; largura: number; altura: number }>;
}> | null = null;

async function logoPng(arquivo: string, largura: number) {
  const { data, info } = await sharp(arquivo)
    .resize({ width: largura * 2 })
    .png()
    .toBuffer({ resolveWithObject: true });
  return {
    src: `data:image/png;base64,${data.toString('base64')}`,
    largura,
    altura: Math.round((info.height / info.width) * largura),
  };
}

function carregar(publico: string) {
  recursos ??= (async () => ({
    fontes: [
      {
        name: 'Source Serif 4',
        data: await fonte('@fontsource/source-serif-4', 'source-serif-4-latin-500-normal.woff'),
        weight: 500,
        style: 'normal',
      },
      {
        name: 'Montserrat',
        data: await fonte('@fontsource/montserrat', 'montserrat-latin-600-normal.woff'),
        weight: 600,
        style: 'normal',
      },
    ],
    logos: {
      hugo: await logoPng(`${publico}/brand/hugo-martins-horizontal.webp`, 420),
      lumi: await logoPng(`${publico}/brand/lumi-branco.svg`, 300),
    },
  }))();
  return recursos;
}

const estilo = {
  hugo: { filete: '#02b9ca', fonte: 'Source Serif 4', peso: 500, espaco: -0.5 },
  lumi: { filete: '#0079b6', fonte: 'Montserrat', peso: 600, espaco: 0 },
};

/** Tamanho do título pelo comprimento: textos longos descem para caber em até 3 linhas. */
export function tamanhoTitulo(titulo: string): number {
  if (titulo.length <= 34) return 76;
  if (titulo.length <= 60) return 64;
  if (titulo.length <= 90) return 54;
  return 46;
}

export async function gerarOg(titulo: string, marca: Marca, publico: string): Promise<Buffer> {
  const { fontes, logos } = await carregar(publico);
  const logo = logos[marca];
  const e = estilo[marca];

  const arvore = {
    type: 'div',
    props: {
      // No satori o padding soma à largura e à altura (content-box): desconta aqui.
      style: {
        width: LARGURA - 2 * MARGEM_X,
        height: ALTURA - MARGEM_TOPO - MARGEM_BASE,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: `${MARGEM_TOPO}px ${MARGEM_X}px ${MARGEM_BASE}px`,
        backgroundColor: '#000523',
      },
      children: [
        {
          type: 'img',
          props: { src: logo.src, width: logo.largura, height: logo.altura },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: 72,
                    height: 4,
                    marginBottom: 32,
                    backgroundColor: e.filete,
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    maxWidth: 1000,
                    fontFamily: e.fonte,
                    fontWeight: e.peso,
                    fontSize: tamanhoTitulo(titulo),
                    lineHeight: 1.12,
                    letterSpacing: e.espaco,
                    color: '#f3f0e8',
                  },
                  children: titulo,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(arvore as Parameters<typeof satori>[0], {
    width: LARGURA,
    height: ALTURA,
    fonts: fontes,
  });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
