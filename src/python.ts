import * as vscode from "vscode";

export async function getPythonExtension(): Promise<any> {
  const pythonExtension = vscode.extensions.getExtension("ms-python.python");
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
  const env = await extension.environments.getActiveEnvironmentPath();
  return env.path;
}

export async function setVirtualEnvPath(path: string): Promise<void> {
  const extension = await getPythonExtension();
  await extension.environments.updateActiveEnvironmentPath(path);
}
