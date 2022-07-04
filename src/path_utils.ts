import { sep } from "../deps.ts";

/**
 * toPosixPath converts the given path to the POSIX form; converts \\ to /.
 *
 * @param path Path to transform.
 *
 * @return string The POSIX path.
 */
export function toPosixPath(path: string): string {
  return path.replace(/[\\]/g, "/");
}

/**
 * toWin32Path converts the given path to the Windows form; converts / to \\.
 *
 * @param path Path to transform.
 *
 * @return string The Win32 path.
 */
export function toWin32Path(path: string): string {
  return path.replace(/[/]/g, "\\");
}

/**
 * toPlatformPath converts the given path to a platform-specific path.
 *
 * @param path The path to platform-ize.
 *
 * @return string The platform-specific path.
 */
export function toPlatformPath(path: string): string {
  return path.replace(/[/\\]/g, sep);
}
