import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({ entryPoints: ["scripts/verify-itinerary.ts"], bundle: true, platform: "node", format: "cjs", jsx: "automatic", outfile: ".site-deploy/verify-itinerary.cjs" });
const result = spawnSync(process.execPath, [".site-deploy/verify-itinerary.cjs"], { stdio: "inherit" });
process.exitCode = result.status || 0;
