import * as vscode from "vscode";

import { findIsolatedDecorators } from "./isolate";

export class IsolatedDecoratorCodeLensProvider
  implements vscode.CodeLensProvider
{
  public async provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    if (document.languageId !== "python") {
      return codeLenses;
    }
    const isolatedPositions = findIsolatedDecorators(document);
    if (isolatedPositions.length === 0) {
      return codeLenses;
    }
    const filename = document.fileName;
    for (const position of isolatedPositions) {
      const range = new vscode.Range(position, position);
      const runCodeLens = new vscode.CodeLens(range, {
        title: "run",
        command: "falServerless.run",
        arguments: [filename, range.start.line + 1],
      });
      // const scheduleCodeLens = new vscode.CodeLens(range, {
      //   title: "schedule",
      //   command: "extension.scheduleIsolatedFunction",
      //   arguments: [range],
      // });
      // const serveCodeLens = new vscode.CodeLens(range, {
      //   title: "serve",
      //   command: "extension.serveIsolatedFunction",
      //   arguments: [range],
      // });
      // const optionsCodeLens = new vscode.CodeLens(range, {
      //   title: "$(kebab-horizontal)",
      //   command: "extension.pickMachineType",
      //   arguments: [range],
      // });

      codeLenses.push(
        runCodeLens
        // scheduleCodeLens,
        // serveCodeLens,
        // optionsCodeLens
      );
    }

    return codeLenses;
  }

  // public resolveCodeLens(
  //   codeLens: vscode.CodeLens,
  //   token: vscode.CancellationToken
  // ): vscode.CodeLens {
  //   if (codeLens.) {

  //   }
  //   return codeLens;
  // }
}
