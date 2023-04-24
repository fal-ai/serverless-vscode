import { Logger } from "tslog";
import { OutputChannel } from "vscode";

export type LogLevel =
  | "silly"
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal";

const logLevels: Record<string, number> = {
  silly: 0,
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
  fatal: 6,
};

export type LoggingConfig = {
  level: string;
  channel: OutputChannel;
};

let config: LoggingConfig;
let logger: Logger<unknown>;

export function configLogging(cfg: LoggingConfig) {
  config = cfg;
  const level = logLevels[config.level];
  logger = new Logger({
    name: "falServerless",
    type: "pretty",
    minLevel: level,
    stylePrettyLogs: false,
    overwrite: {
      transportFormatted(logMetaMarkup, logArgs, logErrors, settings) {
        config.channel.appendLine([logMetaMarkup, ...logArgs].join(" "));
      },
    },
  });
}

export function getLogger(
  name: string | undefined = undefined
): Logger<unknown> {
  if (name) {
    return logger.getSubLogger({ name });
  }
  return logger;
}
