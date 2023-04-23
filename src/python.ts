import * as vscode from "vscode";
import { IExtensionApi } from "./types/ms-python";

export async function getPythonExtension(): Promise<IExtensionApi> {
  const pythonExtension =
    vscode.extensions.getExtension<IExtensionApi>("ms-python.python");
  if (!pythonExtension) {
    vscode.window.showErrorMessage("Python extension not found");
    throw new Error("Python extension not found");
  }

  if (!pythonExtension.isActive) {
    await pythonExtension.activate();
  }
  return pythonExtension.exports;
}

export async function getInterpreterPath(): Promise<string> {
  const extension = await getPythonExtension();
  await extension.environments.refreshEnvironments();
  const path = extension.environments.getActiveEnvironmentPath();
  const env = await extension.environments.resolveEnvironment(path);
  return env ? env.path : "python";
}

export async function setVirtualEnvPath(
  path: string,
  file: string
): Promise<void> {
  const extension = await getPythonExtension();
  await extension.environments.updateActiveEnvironmentPath(
    path,
    vscode.Uri.parse(file)
  );
}
