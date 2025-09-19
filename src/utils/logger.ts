import { consola } from "consola";

export const logger = consola.withTag("scaffolder");

export function outputLine(line: string): void {
  return logger.info(`${line}\n`);
}
