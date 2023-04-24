import { exec as execWithCallback } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";

import { getLogger } from "./logging";
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

function buildCommand(commands: string[]): string {
  return commands
    .map((command) => (command.includes(" ") ? `"${command}"` : command))
    .join(" ");
}

function command(
  command: string,
  args: any[] = [],
  options: Record<string, any> = {}
) {
  const commandOptions = options
    .keys()
    .map((option: string) => `${option}=${options[option]}`);
  return buildCommand(["fal-serverless", command, ...args, ...commandOptions]);
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
  const scriptPath = path.resolve(__dirname, "..", SCRIPTS, script);
  return exec(buildCommand([pythonPath, scriptPath, ...args]));
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
    await exec(buildCommand(["mkdir", "-p", folder]));
  }
  const linkPath = path.join(folder, envName);
  if (fs.existsSync(linkPath)) {
    await exec(buildCommand(["rm", linkPath]));
  }
  await exec(buildCommand(["ln", "-s", env, linkPath]));
  await setVirtualEnvPath(path.join(linkPath, "bin", "python"), file);
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
  const logger = getLogger("installExtensionModule");
  const interpreter = await getInterpreterPath();
  logger.info("Using python interpreter: ", interpreter);
  const envPath = path.resolve(storagePath, "venv");
  logger.debug("Using venv path for the extension module:", envPath);

  const pipExec = path.join(envPath, "bin", "pip");
  const modulePath = path.resolve(__dirname, "..", "python");
  const install = buildCommand([pipExec, "install", modulePath]);
  logger.debug("Using pip install command:", install);

  if (!fs.existsSync(envPath)) {
    logger.info("Creating virtualenv for the extension module");
    const result = await exec(
      buildCommand([interpreter, "-m", "venv", envPath])
    );
    handleResult(result);
    await exec(install);
  } else if (force) {
    logger.info("Reinstalling extension module");
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

    const runScript = path.resolve(__dirname, "..", SCRIPTS, "run.py");
    terminal.sendText(`export RUN_SCRIPT="${runScript}"`);
    terminal.sendText(`export PYTHON_EXEC="${getExtensionPythonPath()}"`);
    terminal.sendText("clear");

    const cmd = ["$PYTHON_EXEC", "$RUN_SCRIPT", `"${filename}"`, metadata.name];
    terminal.sendText(buildCommand(cmd));
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
