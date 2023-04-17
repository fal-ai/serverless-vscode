import * as vscode from "vscode";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { exec as execWithCallback } from "child_process";
import { promisify } from "util";

import { getInterpreterPath, setVirtualEnvPath } from "./python";
import { IsolateFunctionMetadata } from "./types";

const SCRIPTS = "./fal_serverless_vscode/scripts";

const exec = promisify(execWithCallback);

type ExecResult = {
  stdout: string;
  stderr: string;
};

function handleResult(result: ExecResult): string {
  const { stdout, stderr } = result;
  if (stderr && stderr.trim().length > 0) {
    throw new Error(stderr.trim());
  }
  return stdout.trim();
}

function command(
  command: string,
  args: any[] = [],
  options: Record<string, any> = {}
) {
  const commandOptions = options
    .keys()
    .map((option: string) => `${option}=${options[option]}`);
  return ["fal-serverless", command, ...args, ...commandOptions].join(" ");
}

async function python(command: string[]): Promise<ExecResult> {
  const interpreter = await getInterpreterPath();
  return exec([interpreter, ...command].join(" "));
}

async function pip(command: string[]): Promise<ExecResult> {
  return python(["-m", "pip", ...command]);
}

export async function activateIsolatedEnvironment(
  storage: string,
  file: string
): Promise<void> {
  const metadata = await getIsolateMetadata(file);
  const requirements = metadata.flatMap(
    (func) => func.isolate_node.params.requirements
  );
  const key = `${file}:${requirements}`;
  const hash = crypto.createHash("sha256");
  hash.update(key);

  const name = path.basename(file, ".py");
  const envName = hash.digest("hex");
  const envPath = path.resolve(
    storage,
    "virtualenvs",
    envName,
    `${name}_isolated`
  );
  console.log("envPath", envPath);
  if (fs.existsSync(envPath)) {
    await setVirtualEnvPath(path.resolve(envPath, "bin", "python"));
    return;
  }
  await exec(["virtualenv", envPath].join(" "));
  await setVirtualEnvPath(path.resolve(envPath, "bin", "python"));
  await installExtensionModule();

  // install all dependencies of a file + fal-serverless
  // this is a naive approach and do not emulate how isolate works
  // however, for development purposes it will work for most cases
  // the environment created will not be the same used to execute the function
  // so the isolate behavior remains the same
  const defaultRequirements = ["fal-serverless"];
  await pip(["install", ...defaultRequirements, ...requirements]);
}

export async function installExtensionModule(): Promise<void> {
  try {
    const info = await pip(["show", "fal_serverless_vscode"]);
    const isInstalled = info.stdout.includes("Name: fal-serverless-vscode");
    if (!isInstalled) {
      await pip(["install", "."]);
    }
  } catch (e) {
    // TODO log error?
    await pip(["install", "."]);
  }
}

export async function getIsolateMetadata(
  file: string
): Promise<IsolateFunctionMetadata[]> {
  const result = await python([`${SCRIPTS}/metadata.py`, file]);
  const metadata: IsolateFunctionMetadata[] = JSON.parse(handleResult(result));
  return metadata;
}

export async function checkSetup(): Promise<boolean> {
  const result = await exec(command("--help"));
  return result.stdout.indexOf("command not found") === -1;
}

export async function isAuthenticated(): Promise<boolean> {
  const result = await exec(command("auth hello"));
  return false;
}

export async function runFunction(
  filename: string,
  isolatedLine: number
): Promise<void> {
  const functions = await getIsolateMetadata(filename);
  const metadata = functions.find(
    (func) => func.isolate_node.line.start_line === isolatedLine
  );
  console.log(metadata);
  if (metadata) {
    const terminal = vscode.window.createTerminal(`run ${metadata.name}`);

    const interpreter = await getInterpreterPath();
    terminal.sendText("source " + path.resolve(interpreter, "..", "activate"));

    const runScript = path.resolve(SCRIPTS, "run.py");
    const cmd = ["python", runScript, filename, metadata.name];
    terminal.sendText(cmd.join(" "));
    terminal.show();
  }
}

export async function scheduleFunction(
  file: string,
  functionName: string,
  cron: string
): Promise<string> {
  const result = await exec(
    command("function schedule", [file, functionName, cron])
  );
  return "";
}

export async function serveFunction(
  file: string,
  functionName: string
): Promise<string> {
  const result = await exec(command("function serve", [file, functionName]));
  return "";
}
