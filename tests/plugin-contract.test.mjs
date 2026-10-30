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
