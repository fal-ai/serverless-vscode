import { ConfigurationTarget, workspace, WorkspaceConfiguration } from "vscode";

function getWorkspaceConfiguration(): WorkspaceConfiguration {
  return workspace.getConfiguration("falServerless");
}

export async function saveExtensionVirtualEnv(envPath: string): Promise<void> {
  const state = getWorkspaceConfiguration();
  return state.update("extensionEnv", envPath, ConfigurationTarget.Global);
}

export function getExtensionVirtualEnv(): string | undefined {
  const state = getWorkspaceConfiguration();
  return state.get("extensionEnv");
}
