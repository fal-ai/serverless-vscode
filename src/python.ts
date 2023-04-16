import * as vscode from "vscode";
// import { IExtensionApi as PythonExtension } from "ms-python";

export async function getPythonExtension(): Promise<vscode.Extension<any>> {
  const pythonExtension = vscode.extensions.getExtension("ms-python.python");
  if (!pythonExtension) {
    vscode.window.showErrorMessage("Python extension not found");
    throw new Error();
  }

  if (!pythonExtension.isActive) {
    await pythonExtension.activate();
  }
  return pythonExtension.exports;
}
