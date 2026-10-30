import { Service, type Context } from '@deepseek-ai/cordis';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import type { PreStepDecision } from '@deepseek-ai/dsh-agent';
import type { ContextFormed } from '@deepseek-ai/dsh-llm';
import type { SkillRegistration } from '@deepseek-ai/dsh-skill';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

declare module '@deepseek-ai/dsh-llm' {
  interface MessageSourceMap {
    'mulqi-superpowers-bootstrap': { kind: 'mulqi-superpowers-bootstrap' } & ContextFormed;
  }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    mulqiSuperpowers: MulqiSuperpowersService;
  }
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_ROOT = resolve(ROOT, 'vendor', 'skills');
const MARKER = '<!-- mulqi-superpowers:bootstrap:v1 -->';
const SOURCE = { kind: 'mulqi-superpowers-bootstrap' } as const;

function parseSkill(raw: string, filePath: string, directory: string) {
  if (!raw.startsWith('---\n') && !raw.startsWith('---\r\n')) throw new Error(`Missing frontmatter: ${filePath}`);
  const start = raw.indexOf('\n') + 1;
  const end = raw.indexOf('\n---', start);
  if (end < 0) throw new Error(`Unclosed frontmatter: ${filePath}`);
  const metadata = parseYaml(raw.slice(start, end)) as Record<string, unknown>;
  const bodyStart = raw.indexOf('\n', end + 1);
  const content = bodyStart < 0 ? '' : raw.slice(bodyStart + 1);
  const name = typeof metadata.name === 'string' ? metadata.name : directory;
  const description = typeof metadata.description === 'string' ? metadata.description : '';
  if (!name || !description) throw new Error(`Missing name/description: ${filePath}`);
  const user = metadata['user-invocable'] !== false;
  const model = metadata['disable-model-invocation'] !== true;
  const extra = { ...metadata };
  delete extra.name; delete extra.description; delete extra['user-invocable']; delete extra['disable-model-invocation'];
  return {
    name, description,
    ...(typeof metadata['when-to-use'] === 'string' ? { whenToUse: metadata['when-to-use'] } : {}),
    invocation: { userInvocable: user, modelInvocable: model }, source: 'bundled' as const,
    provider: 'mulqi-superpowers' as const, path: filePath,
    resourceBase: { kind: 'directory' as const, path: resolve(SKILLS_ROOT, directory) },
    content, metadata: extra,
  } satisfies SkillRegistration;
}

function textOf(message: any): string {
  if (typeof message?.content === 'string') return message.content;
  if (Array.isArray(message?.content)) return message.content.map((part: any) => part?.text ?? '').join('\n');
  return typeof message?.text === 'string' ? message.text : '';
}
function isBootstrap(message: any): boolean {
  return message?.source?.kind === SOURCE.kind || textOf(message).includes(MARKER);
}
function firstNonSummary(messages: any[]): number {
  let i = 0;
  while (i < messages.length && (messages[i]?.source?.kind === 'compaction-summary' || messages[i]?.type === 'compaction_summary')) i++;
  return i;
}

export class MulqiSuperpowersService extends Service {
  static inject = ['skills'];
  private readonly bodies = new Map<string, string>();
  private readonly ready: Promise<void>;

  constructor(ctx: Context) {
    super(ctx, 'mulqiSuperpowers');
    this.ready = this.registerSkills();
    this.installBootstrap();
  }

  private async registerSkills(): Promise<void> {
    const ctx = this.ctx as Context & { skills: { register(value: SkillRegistration): void } };
    const dirs = (await readdir(SKILLS_ROOT, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    let foundBootstrapSkill = false;
    for (const dir of dirs) {
      const path = resolve(SKILLS_ROOT, dir, 'SKILL.md');
      const raw = await readFile(path, 'utf8');
      const skill = parseSkill(raw, path, dir);
      this.bodies.set(skill.name, skill.content);
      if (skill.name === 'using-superpowers') foundBootstrapSkill = true;
      ctx.skills.register(skill);
    }
    if (!foundBootstrapSkill) throw new Error('Required using-superpowers skill is missing.');
    ctx.logger?.info?.(`[mulqi-superpowers] Registered ${this.bodies.size} bundled skills.`);
  }

  private installBootstrap(): void {
    this.ctx.on('agent/pre-step', async ({ signal }, next) => {
      await this.ready;
      const decision = await next() as PreStepDecision;
      if (signal?.aborted || decision?.kind !== 'enter' || !Array.isArray(decision.messages)) return decision;
      if (decision.messages.some(isBootstrap)) return decision;
      const body = this.bodies.get('using-superpowers');
      if (!body) return decision;
      const text = [MARKER, '<EXTREMELY_IMPORTANT>', body.trim(), '</EXTREMELY_IMPORTANT>', '',
        'Use only these model-facing tools when they are present in the active profile:',
        'skill; read; read_image; write; edit; glob; grep; bash (POSIX) or pwsh (PowerShell);',
        'subagent; subagent_fork; send_message; interrupt_agent; list_agents; todo_write; web_search; web_fetch.',
        'Do not invent missing tools. Bash scripts are not directly executable by pwsh. Browser/computer-use tools are profile-dependent.'].join('\n');
      const message = createUserMessage({
        content: [{ type: 'text', text }],
        source: { kind: SOURCE.kind, form: 'snapshot', sections: [{ name: 'using-superpowers', text }] },
      });
      const messages = [...decision.messages];
      messages.splice(firstNonSummary(messages), 0, message);
      return { ...decision, messages, startsRequestSeries: true };
    });
  }
}

export default MulqiSuperpowersService;
