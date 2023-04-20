import { exec as execWithCallback } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";

import { getInterpreterPath, setVirtualEnvPath } from "./python";
import { getExtensionVirtualEnv, saveExtensionVirtualEnv } from "./state";
import { IsolateFunctionMetadata } from "./types";

const SCRIPTS = "./python/fal_serverless_vscode/scripts";

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

function getExtensionPythonPath(): string {
  const envPath = getExtensionVirtualEnv();
  if (!envPath) {
    throw new Error("Extension virtualenv not found");
  }
  return path.join(envPath, "bin", "python");
}

async function runScript(
  script: string,
  args: string[] = []
): Promise<ExecResult> {
  const pythonPath = getExtensionPythonPath();
  return exec([pythonPath, `${SCRIPTS}/${script}`, ...args].join(" "));
}

export async function activateIsolatedEnvironment(
  storage: string,
  file: string
): Promise<void> {
  const metadata = await getIsolateMetadata(file);
  const requirements = metadata.flatMap(
    (func) => func.isolate_node.params.requirements
  );
  const env = await createIsolatedEnvironment([
    "fal-serverless",
    ...requirements,
  ]);

  // create a symbolic link to the env path so we get a consistent label
  // in the python interpreter list in vscode
  const envName = path.basename(file, ".py") + "_isolated";
  const folder = path.resolve(storage, "virtualenv");
  if (!fs.existsSync(folder)) {
    await exec(["mkdir", "-p", folder].join(" "));
  }
  const linkPath = path.join(folder, envName);
  if (fs.existsSync(linkPath)) {
    await exec(["rm", linkPath].join(" "));
  }
  await exec(["ln", "-s", env, linkPath].join(" "));
  await setVirtualEnvPath(path.join(linkPath, "bin", "python"));
}

export async function createIsolatedEnvironment(
  requirements: string[] = []
): Promise<string> {
  const result = await runScript("env.py", [requirements.join(",")]);
  const output = handleResult(result);
  const lines = output.split("\n");
  return lines[lines.length - 1].trim();
}

export async function installExtensionModule(
  storagePath: string,
  force: boolean = false
): Promise<void> {
  const envPath = path.resolve(storagePath, "venv");

  const pythonExec = path.join(envPath, "bin", "python");
  const modulePath = path.join(__dirname, "..", "python");
  const install = [pythonExec, "-m", "pip", "install", modulePath].join(" ");

  if (!fs.existsSync(envPath)) {
    const result = await exec(`virtualenv ${envPath}`);
    handleResult(result);
    await exec(install);
  } else if (force) {
    await exec(install);
  }
  await saveExtensionVirtualEnv(envPath);
}

export async function getIsolateMetadata(
  file: string
): Promise<IsolateFunctionMetadata[]> {
  const result = await runScript("metadata.py", [file]);
  const metadata: IsolateFunctionMetadata[] = JSON.parse(handleResult(result));
  return metadata;
}

export async function checkSetup(): Promise<boolean> {
  const result = await exec(command("--help"));
  return result.stdout.indexOf("command not found") === -1;
}

export async function isAuthenticated(): Promise<boolean> {
  const result = await exec(command("auth hello"));
  return handleResult(result).startsWith("Hello, ");
}

export async function runFunction(
  filename: string,
  isolatedLine: number
): Promise<void> {
  const functions = await getIsolateMetadata(filename);
  const metadata = functions.find(
    (func) => func.isolate_node.line.start_line === isolatedLine
  );
  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  if (metadata) {
    const terminal = vscode.window.createTerminal(`run ${metadata.name}`);

    terminal.show(true);
    // need to wait a bit so the environment is activated
    await delay(500);

    const runScript = path.resolve(SCRIPTS, "run.py");
    terminal.sendText(`export RUN_SCRIPT=${runScript}`);
    terminal.sendText(`export PYTHON_EXEC=${getExtensionPythonPath()}`);
    terminal.sendText("clear");

    const cmd = ["$PYTHON_EXEC", "$RUN_SCRIPT", filename, metadata.name];
    terminal.sendText(cmd.join(" "));
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
