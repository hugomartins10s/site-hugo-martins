/**
 * Datas do front matter ("2026-11-25") viram meia-noite UTC. Formatar sempre em UTC, senão o
 * fuso de quem roda o build pode mostrar o dia anterior.
 */
export const dataIso = (d: Date) => d.toISOString().slice(0, 10);

export function dataCurta(d: Date): string {
  const [ano, mes, dia] = dataIso(d).split('-');
  return `${dia}/${mes}/${ano}`;
}
