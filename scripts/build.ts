import path from "node:path";
import url from "node:url";
import { build as esbuild } from "esbuild";
import { randomUUID } from "node:crypto";

const srcPath = path.join(process.cwd(), "src");
const buildPath = path.join(process.cwd(), "build");

async function build() {
  const buildId = randomUUID().replace(/-/g, "");

  return esbuild({
    platform: "browser",
    target: "es2020",
    format: "esm",
    nodePaths: [srcPath],
    sourcemap: true,
    external: [],
    bundle: true,
    entryPoints: [path.join(srcPath, "index.ts")],
    outdir: buildPath,
    minify: true,
  });
}

if (import.meta.url.startsWith("file:")) {
  if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
    await build();
  }
}
