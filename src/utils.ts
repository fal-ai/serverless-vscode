import { TextDocument } from "vscode";

export function isPythonDocument(document: TextDocument): boolean {
  return document.languageId === "python";
}
