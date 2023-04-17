import { ExtensionContext } from "vscode";
import { IsolateFunctionMetadata } from "./types";

export function saveFunctionMetadata(
  context: ExtensionContext,
  file: string,
  metadata: IsolateFunctionMetadata
) {
  context.workspaceState.update("extension.isolate.functions", metadata);
}
