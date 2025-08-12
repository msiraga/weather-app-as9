import { execSync } from "node:child_process";

try {
  console.log("Running build smoke test...");
  execSync("pnpm -s build", { stdio: "inherit", env: { ...process.env, CI: "true" } });
  console.log("Build succeeded.");
} catch (err) {
  console.error("Build failed.");
  process.exit(1);
}


