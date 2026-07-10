import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const excluded = new Set([".git"]);
const vendorFiles = new Set([
  join("All pages", "assets", "javascripts", "bootstrap.js"),
  join("All pages", "assets", "javascripts", "popper.min.js")
]);

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (excluded.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const projectFiles = files(root);
const errors = [];

for (const path of projectFiles.filter((file) => extname(file) === ".js")) {
  const projectPath = relative(root, path);
  if (vendorFiles.has(projectPath)) continue;
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  if (result.status !== 0) errors.push(`${projectPath}: ${result.stderr.trim()}`);
}

for (const path of projectFiles.filter((file) => [".json", ".JSON"].includes(extname(file)))) {
  try {
    JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    errors.push(`${relative(root, path)}: invalid JSON (${error.message})`);
  }
}

for (const required of [
  "index.html",
  join("All pages", "login.html"),
  join("All pages", "dashboard.html"),
  join("All pages", "edit-profile.html")
]) {
  if (!existsSync(join(root, required))) errors.push(`${required}: required file is missing`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Project check passed (${projectFiles.length} files scanned).`);
