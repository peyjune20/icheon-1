import { build } from "esbuild";
import { spawnSync } from "node:child_process";
for (const name of ["verify-itinerary", "verify-integrations"]) {
  await build({ entryPoints: ["scripts/" + name + ".ts"], bundle: true, platform: "node", format: "cjs", jsx: "automatic", outfile: ".site-deploy/" + name + ".cjs" });
  const result = spawnSync(process.execPath, [".site-deploy/" + name + ".cjs"], { stdio: "inherit" });
  if (result.status) { process.exitCode = result.status; break; }
}
