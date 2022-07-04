export {
  appendFileSync,
  existsSync,
} from "https://deno.land/std@0.146.0/node/fs.ts";

export { SEP as sep } from "https://deno.land/std@0.146.0/path/separator.ts";

// The one in ./src/utils.ts is what should be used.
export { EOL } from "https://deno.land/std@0.146.0/fs/eol.ts";

export {
  dirname,
  fromFileUrl,
} from "https://deno.land/std@0.146.0/path/mod.ts";
