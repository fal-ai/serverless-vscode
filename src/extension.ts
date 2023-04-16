import * as vscode from "vscode";

import { IsolatedDecoratorCodeLensProvider } from "./codelens";
import { findIsolatedDecorators } from "./isolate";
import { getPythonExtension } from "./python";
import { isPythonDocument } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  const pythonExtension = await getPythonExtension();
  console.log("-------------------------------------");
  console.log(pythonExtension);
  console.log("-------------------------------------");

  const onDidOpenTextDocumentListener = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      if (isPythonDocument(document)) {
        const decorators = findIsolatedDecorators(document);
        console.log("decorators found:");
        console.log(decorators);
        if (decorators.length > 0) {
          // Your extension logic goes here, for example:
          vscode.window.showInformationMessage(
            "Activated for file with @isolated decorator"
          );
        }
      }
    }
  );
  context.subscriptions.push(onDidOpenTextDocumentListener);

  // Code Lens
  const codeLensProvider = new IsolatedDecoratorCodeLensProvider();
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { language: "python" },
    codeLensProvider
  );
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {}
