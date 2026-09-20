import { build } from "esbuild";
import { cp, mkdir } from "node:fs/promises";
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
await build({ entryPoints: ["src/server/worker.ts"], bundle: true, format: "esm", target: "es2022", outfile: "dist/server/index.js", platform: "browser" });
await cp("out", "dist/client", { recursive: true });
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
await cp("drizzle", "dist/.openai/drizzle", { recursive: true });
