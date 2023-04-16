import { exec as execWithCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execWithCallback);

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

export async function isAuthenticated(): Promise<boolean> {
  const result = await exec(command("auth hello"));
  return false;
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
