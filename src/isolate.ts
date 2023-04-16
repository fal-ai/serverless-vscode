import type { Position, TextDocument } from "vscode";

export function isIsolateDecorator(text: string): RegExpExecArray | null {
  const pattern = /@isolated\(?/gm;
  return pattern.exec(text);
}

export function findIsolatedDecorators(document: TextDocument): Position[] {
  const pattern = /@isolated\(?/gm;
  const text = document.getText();
  const decoratorPositions: Position[] = [];

  let match;
  while ((match = pattern.exec(text)) !== null) {
    const position = document.positionAt(match.index);
    decoratorPositions.push(position);
  }

  return decoratorPositions;
}
