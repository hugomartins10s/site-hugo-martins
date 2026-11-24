#!/usr/bin/env node
// Contraste WCAG dos pares de cor do sistema, incluindo texto sobre vidro no pior fundo
// (spec 9.3). Sai com código 1 se algum par ficar abaixo do mínimo. Uso: npm run check:contraste
import { avaliar } from '../src/lib/contraste.ts';

const resultado = avaliar();
const largura = Math.max(...resultado.map((r) => r.nome.length));
for (const r of resultado) {
  const marca = r.ok ? '✓' : '✗';
  console.log(
    `${marca} ${r.nome.padEnd(largura)}  ${r.razao.toFixed(2).padStart(5)}:1  (mín. ${r.minimo})  ${r.texto} / ${r.fundo}`,
  );
}
const falhas = resultado.filter((r) => !r.ok);
if (falhas.length) {
  console.error(`\n✗ ${falhas.length} par(es) abaixo do mínimo.`);
  process.exit(1);
}
console.log(`\n✓ ${resultado.length} pares dentro do mínimo WCAG 2.2 AA.`);
