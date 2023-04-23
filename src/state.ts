import { ExtensionContext } from "vscode";

const NS = "falServerless";

let context: ExtensionContext;

export function loadState(ctx: ExtensionContext) {
  context = ctx;
}

export async function saveExtensionVirtualEnv(envPath: string): Promise<void> {
  return context.globalState.update(`${NS}.extensionEnv`, envPath);
}

export function getExtensionVirtualEnv(): string | undefined {
  return context.globalState.get<string>(`${NS}.extensionEnv`);
}
