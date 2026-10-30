import type { Service, Context } from '@deepseek-ai/cordis';
import type { ContextFormed } from '@deepseek-ai/dsh-llm';
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
export declare const name: 'mulqi-superpowers';
export declare const TOOL_MAPPING: Readonly<Record<string, unknown>>;
export declare class MulQiSuperpowersService extends Service {
  static inject: string[];
  constructor(ctx: Context);
}
export default MulqiSuperpowersService;
