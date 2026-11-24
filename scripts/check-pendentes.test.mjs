// Testes da trava de pendências: `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = new URL('./check-pendentes.mjs', import.meta.url).pathname;

function rodar(conteudo, ...flags) {
  const dir = mkdtempSync(join(tmpdir(), 'trava-'));
  writeFileSync(join(dir, 'entrada.md'), conteudo);
  const r = spawnSync(process.execPath, [SCRIPT, ...flags, dir], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  return r;
}

test('conteúdo limpo passa', () => {
  assert.equal(rodar('---\ntitulo: O que é o 10S?\n---\nTodos os textos confirmados.\n').status, 0);
});

for (const [nome, texto] of [
  ['[PENDENTE]', 'Corpo: [PENDENTE]'],
  ['[pendente] minúsculo', 'corpo [pendente]'],
  ['[?]', 'Preço: [?]'],
  ['TODO', 'TODO escrever'],
  ['lorem', 'Lorem ipsum dolor'],
]) {
  test(`${nome} quebra o build`, () => {
    const r = rodar(texto);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /Trava de pendências/);
  });
}

test('--aviso lista mas não quebra (homologação)', () => {
  const r = rodar('Corpo: [PENDENTE]', '--aviso');
  assert.equal(r.status, 0);
  assert.match(r.stderr, /Homologação/);
});

test('palavras parecidas não disparam (TODOS, loremaster)', () => {
  assert.equal(rodar('TODOS os dias. loremaster.').status, 0);
});
