import * as semver from "semver";
import { ExtensionContext, TextDocument } from "vscode";

export function isPythonDocument(document: TextDocument): boolean {
  return document.languageId === "python";
}

export async function hasVersionChanged(
  context: ExtensionContext
): Promise<boolean> {
  const key = "falServerless.state.installedVersion";
  let version: string | undefined = context.globalState.get(key);
  let changed = false;
  if (!version) {
    changed = true;
  } else {
    const packageVersion = require("../package.json").version;
    changed = semver.gt(packageVersion, version);
    version = packageVersion;
  }
  await context.globalState.update(key, version);
  return false;
}
