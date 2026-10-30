import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8');
const runtime = await readFile(new URL('../lib/index.js', import.meta.url), 'utf8');

test('package declares a native DeepSeek Harness bundle patch', () => {
  assert.equal(pkg.name, 'mulqi-superpowers');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.match(patch, /id: mulqi-superpowers/);
});

test('adapter uses the documented skill registry and agent message lifecycle', () => {
  assert.match(runtime, /ctx\.skills\.register/);
  assert.match(runtime, /agent\/pre-step/);
  assert.match(runtime, /createUserMessage/);
  assert.match(runtime, /using-superpowers/);
});

test('bootstrap maps only documented base-profile tool names', () => {
  for (const name of ['skill','read','read_image','write','edit','glob','grep','bash','pwsh','subagent','subagent_fork','send_message','interrupt_agent','list_agents','todo_write','web_search','web_fetch']) {
    assert.ok(runtime.includes(name), `missing mapping: ${name}`);
  }
  assert.match(runtime, /Browser\/computer-use capability is profile-dependent/);
});


test('compiled adapter named and default service exports use the same class identifier', () => {
  const namedClass = runtime.match(/export class (\w+) extends Service/);
  const defaultClass = runtime.match(/export default (\w+);/);
  assert.ok(namedClass, 'named service class export is present');
  assert.ok(defaultClass, 'default service class export is present');
  assert.equal(namedClass[1], 'MulqiSuperpowersService');
  assert.equal(defaultClass[1], namedClass[1]);
  assert.doesNotMatch(runtime, /\bMulQiSuperpowersService\b/);
});

test('compiled adapter deletes metadata from the correctly named object', () => {
  assert.match(runtime, /const passthroughMetadata = \{ \.\.\.metadata \};/);
  assert.match(runtime, /delete passthroughMetadata\.name;/);
  assert.match(runtime, /delete passthroughMetadata\.description;/);
  assert.doesNotMatch(runtime, /\bpassthroughMetada\b/);
});
