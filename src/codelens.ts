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
    const isolatedPositions = findIsolatedDecorators(document);

    for (const position of isolatedPositions) {
      const range = new vscode.Range(position, position);

      const runCodeLens = new vscode.CodeLens(range, {
        title: "run",
        command: "extension.runIsolatedFunction",
        arguments: [range],
      });
      const scheduleCodeLens = new vscode.CodeLens(range, {
        title: "schedule",
        command: "extension.scheduleIsolatedFunction",
        arguments: [range],
      });
      const serveCodeLens = new vscode.CodeLens(range, {
        title: "serve",
        command: "extension.serveIsolatedFunction",
        arguments: [range],
      });
      const optionsCodeLens = new vscode.CodeLens(range, {
        title: "$(kebab-horizontal)",
        command: "extension.pickMachineType",
        arguments: [range],
      });

      codeLenses.push(
        runCodeLens,
        scheduleCodeLens,
        serveCodeLens,
        optionsCodeLens
      );
    }

    return codeLenses;
  }

  public resolveCodeLens(
    codeLens: vscode.CodeLens,
    token: vscode.CancellationToken
  ): vscode.CodeLens {
    codeLens.command = {
      title: "$(gear)",
      command: "extension.showIsolatedDecoratorOptions",
      arguments: [codeLens.range],
    };
    return codeLens;
  }
}
