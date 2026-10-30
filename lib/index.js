import { Service } from '@deepseek-ai/cordis';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_ROOT = resolve(PACKAGE_ROOT, 'vendor', 'skills');
const BOOTSTRAP_MARKER = '<!-- mulqi-superpowers:bootstrap:v1 -->';
const BOOTSTRAP_SOURCE = Object.freeze({ kind: 'mulqi-superpowers-bootstrap' });

const TOOL_MAPPING = Object.freeze({
  skill: 'skill catalog and skill invocation',
  filesystem: ['read', 'read_image', 'write', 'edit'],
  search: ['glob', 'grep'],
  shell: { posix: 'bash', windows: 'pwsh' },
  delegation: ['subagent', 'subagent_fork'],
  delegationControl: ['send_message', 'interrupt_agent', 'list_agents'],
  planning: ['todo_write'],
  web: ['web_search', 'web_fetch'],
});

function splitFrontmatter(raw, filePath) {
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) {
    throw new Error(`Missing YAML frontmatter: ${filePath}`);
  }
  const firstLineEnd = raw.indexOf('\n') + 1;
  const close = raw.indexOf('\n---', firstLineEnd);
  if (close < 0) throw new Error(`Unclosed YAML frontmatter: ${filePath}`);
  const yamlText = raw.slice(firstLineEnd, close);
  let metadata;
  try {
    metadata = parseYaml(yamlText) ?? {};
  } catch (error) {
    throw new Error(`Invalid YAML frontmatter in ${filePath}: ${error.message}`);
  }
  const bodyStart = raw.indexOf('\n', close + 1);
  const body = bodyStart < 0 ? '' : raw.slice(bodyStart + 1);
  return { metadata, body };
}

function boolFlag(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

async function readSkillDirectories(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

async function loadSkill(skillDirectory) {
  const filePath = resolve(skillDirectory, 'SKILL.md');
  const raw = await readFile(filePath, 'utf8');
  const { metadata, body } = splitFrontmatter(raw, filePath);
  const name = typeof metadata.name === 'string' ? metadata.name : skillDirectory.split(/[\\/]/).at(-1);
  const description = typeof metadata.description === 'string' ? metadata.description : '';
  if (!name || !description) throw new Error(`Skill requires name and description: ${filePath}`);
  const userInvocable = boolFlag(metadata['user-invocable'], true);
  const modelInvocable = !boolFlag(metadata['disable-model-invocation'], false);
  const passthroughMetadata = { ...metadata };
  delete passthroughMetada.name;
  delete passthroughMetada.description;
  delete passthroughMetadata['user-invocable'];
  delete passthroughMetadata['disable-model-invocation'];

  return {
    registration: {
      name,
      description,
      ...(typeof metadata['when-to-use'] === 'string' ? { whenToUse: metadata['when-to-use'] } : {}),
      invocation: { userInvocable, modelInvocable },
      source: 'bundled',
      provider: 'mulqi-superpowers',
      path: filePath,
      resourceBase: { kind: 'directory', path: skillDirectory },
      content: body,
      metadata: passthroughMetadata,
    },
    body,
  };
}

function readMessageText(message) {
  if (!message || typeof message !== 'object') return '';
  const content = message.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => typeof part === 'string' ? part : (part?.text ?? '')).join('\n');
  return typeof message.text === 'string' ? message.text : '';
}

function isBootstrapMessage(message) {
  return message?.source?.kind === BOOTSTRAP_SOURCE.kind
    || readMessageText(message).includes(BOOTSTRAP_MARKER);
}

function firstNonCompactionSummaryIndex(messages) {
  let index = 0;
  while (index < messages.length) {
    const message = messages[index];
    const sourceKind = message?.source?.kind;
    const messageType = message?.type;
    if (sourceKind === 'compaction-summary' || messageType === 'compaction_summary') index += 1;
    else break;
  }
  return index;
}

export class MulQiSuperpowersService extends Service {
  static inject = ['skills'];

  constructor(ctx) {
    super(ctx, 'mulqiSuperpowers');
    this.ctx = ctx;
    this.skillBodies = new Map();
    this.ready = this.registerBundledSkills();
    this.ready.catch((error) => this.ctx.logger?.error?.(`[mulqi-superpowers] ${error.message}`));
    this.installBootstrap();
  }

  async registerBundledSkills() {
    if (!this.ctx.skills || typeof this.ctx.skills.register !== 'function') {
      throw new Error(["mulqi-superpowers] Required ctx.skills.register() service is unavailable."]);
    }
    const names = await readSkillDirectories(SKILLS_ROOT);
    let usingSuperpowersFound = false;
    for (const directoryName of names) {
      const directory = resolve(SKILLS_ROOT, directoryName);
      const loaded = await loadSkill(directory);
      if (loaded.registration.name === 'using-superpowers') usingSuperpowersFound = true;
      this.skillBodies.set(loaded.registration.name, loaded.body);
      this.ctx.skills.register(loaded.registration);
    }
    if (!usingSuperpowersFound) throw new Error('[mulqi-superpowers] Required source skill "using-superpowers" was not found.');
    this.ctx.logger?.info?.(`[mulqi-superpowers] Registered ${this.skillBodies.size} bundled skills.`);
  }

  installBootstrap() {
    this.ctx.on('agent/pre-step', async ({ signal }, next) => {
      await this.ready;
      const decision = await next();
      if (signal?.aborted || !decision || decision.kind !== 'enter' || !Array.isArray(decision.messages)) return decision;
      if (decision.messages.some(isBootstrapMessage)) return decision;
      const sourceBody = this.skillBodies.get('using-superpowers');
      if (!sourceBody) return decision;
      const bootstrapText = [
        BOOTSTRAP_MARKER,
        '<EXTREMELY_IMPORTANT>',
        sourceBody.trim(),
        '</EXTREMELY_IMPORTANT>',
        '',
        'Harness tool mapping available in common profiles (use only tools actually present in this session):',
        '- Skills: skill',
        '- Filesystem: read, read_image, write, edit',
        '- Search: glob, grep',
        '- POSIX shell: bash; Windows shell: pwsh (PowerShell syntax, not Bash)',
        '- Delegation: subagent, subagent_fork',
        '- Delegation controls: send_message, interrupt_agent, list_agents',
        '- Planning: todo_write',
        '- Web: web_search, web_fetch',
        'Do not invent unavailable tools. Bash scripts are not directly executable by pwsh. Browser/computer-use capability is profile-dependent.',
      ].join('\n');
      const message = createUserMessage({
        content: [{ type: 'text', text: bootstrapText }],
        source: { kind: BOOTSTRAP_SOURCE.kind, form: 'snapshot', sections: [{ name: 'using-superpowers', text: bootstrapText }] },
      });
      const messages = [...decision.messages];
      messages.splice(firstNonCompactionSummaryIndex(messages), 0, message);
      return { ...decision, messages, startsRequestSeries: true };
    });
  }
}

export { TOOL_MAPPING };
export default MulqiSuperpowersService;
