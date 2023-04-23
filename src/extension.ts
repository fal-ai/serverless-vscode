import * as vscode from "vscode";

import { IsolatedDecoratorCodeLensProvider } from "./codelens";
import {
  activateIsolatedEnvironment,
  installExtensionModule,
  runFunction,
} from "./integration";
import { findIsolatedDecorators } from "./isolate";
import { loadState } from "./state";
import { hasVersionChanged, isPythonDocument } from "./utils";

export async function activate(context: vscode.ExtensionContext) {
  loadState(context);
  let shouldRefreshEnv =
    context.extensionMode !== vscode.ExtensionMode.Production;
  if (!shouldRefreshEnv) {
    shouldRefreshEnv = await hasVersionChanged(context);
  }
  await installExtensionModule(
    context.globalStorageUri.fsPath,
    shouldRefreshEnv
  );

  vscode.commands.registerCommand("falServerless.run", runFunction);
  vscode.commands.registerCommand("falServerless.refreshExtensionEnv", () => {
    installExtensionModule(context.globalStorageUri.fsPath, true);
  });

  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor && isPythonDocument(activeEditor.document)) {
    const decorators = findIsolatedDecorators(activeEditor.document);
    if (decorators.length > 0) {
      selectEnvironment(context, activeEditor.document.fileName);
    }
  }

  const onDidOpenTextDocumentListener = vscode.workspace.onDidOpenTextDocument(
    (document) => {
      if (isPythonDocument(document)) {
        const decorators = findIsolatedDecorators(document);
        if (decorators.length > 0) {
          selectEnvironment(context, document.fileName);
        }
      }
    }
  );
  context.subscriptions.push(onDidOpenTextDocumentListener);

  const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument(
    (document: vscode.TextDocument) => {
      if (isPythonDocument(document)) {
        const decorators = findIsolatedDecorators(document);
        if (decorators.length > 0) {
          selectEnvironment(context, document.fileName);
        }
      }
    }
  );
  context.subscriptions.push(onDidSaveTextDocument);

  const onDidChangeActiveTextEditorHandler =
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        const document = editor.document;
        if (isPythonDocument(document)) {
          const decorators = findIsolatedDecorators(document);
          if (decorators.length > 0) {
            selectEnvironment(context, document.fileName);
          }
        }
      }
    });
  context.subscriptions.push(onDidChangeActiveTextEditorHandler);

  // Code Lens
  const codeLensProvider = new IsolatedDecoratorCodeLensProvider();
  const codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { language: "python" },
    codeLensProvider
  );
  context.subscriptions.push(codeLensProviderDisposable);
}

export function deactivate() {
  // currently no-op
}

function selectEnvironment(context: vscode.ExtensionContext, filename: string) {
  const progressOptions = {
    location: vscode.ProgressLocation.Window,
    title: "Isolated env build",
    cancellable: false,
  };
  vscode.window.withProgress(progressOptions, (progress) => {
    progress.report({ message: "started..." });
    return activateIsolatedEnvironment(
      (context.storageUri ?? context.globalStorageUri).fsPath,
      filename
    )
      .catch((exception) => {
        console.error(exception);
        vscode.window.showErrorMessage(
          "Error initializing isolated environment: " + exception.message
        );
      })
      .finally(() => {
        progress.report({ message: "done!", increment: 100 });
      });
  });
}
