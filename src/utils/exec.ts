import type { Options, Result } from "tinyexec";
import { x as exec } from "tinyexec";

export async function execInCurrentDir(command: string, args: string[]): Promise<Result> {
  return await exec(command, args, {
    throwOnError: true,
    nodeOptions: {
      stdio: "inherit",
    },
  });
}

export async function execInChildDir(command: string, args: string[], cwd: string, opts?: Partial<Options>): Promise<Result> {
  return await exec(command, args, {
    ...opts,
    throwOnError: true,
    nodeOptions: { ...opts?.nodeOptions, cwd },
  });
}
