import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
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

for (const htmlPath of projectFiles.filter((file) => extname(file) === ".html")) {
  const html = readFileSync(htmlPath, "utf8");
  const references = html.matchAll(/\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi);
  for (const match of references) {
    const reference = match[1] ?? match[2];
    if (!reference || /^(?:#|https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(reference)) continue;
    const cleanReference = decodeURIComponent(reference.split(/[?#]/)[0]);
    const target = cleanReference.startsWith("/")
      ? join(root, cleanReference.slice(1))
      : resolve(dirname(htmlPath), cleanReference);
    if (!existsSync(target)) {
      errors.push(`${relative(root, htmlPath)}: broken local reference "${reference}"`);
    }
  }

  for (const match of html.matchAll(/<script\b([^>]*)\bsrc\s*=\s*"([^"]+)"[^>]*>/gi)) {
    const [, attributes, source] = match;
    if (/\btype\s*=\s*"module"/i.test(attributes) || /^(?:https?:|\/\/)/i.test(source)) continue;
    const scriptPath = resolve(dirname(htmlPath), decodeURIComponent(source));
    if (existsSync(scriptPath) && /^\s*import\s/m.test(readFileSync(scriptPath, "utf8"))) {
      errors.push(`${relative(root, htmlPath)}: module script "${source}" is missing type="module"`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Project check passed (${projectFiles.length} files scanned).`);
