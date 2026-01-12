import { readFile } from "fs/promises";
import { glob } from "glob";

const envVarRegex = /Deno\.env\.get\(\s*['"]([^'"]+)['"]\s*\)/g;

const files = await glob("supabase/functions/**/*.ts", {
  ignore: ["**/node_modules/**"],
});

const referencedEnvVars = new Set();

for (const file of files) {
  const content = await readFile(file, "utf8");
  let match;
  while ((match = envVarRegex.exec(content)) !== null) {
    referencedEnvVars.add(match[1]);
  }
}

const envExample = await readFile(".env.example", "utf8");
const definedVars = new Set(
  envExample
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0])
);

const missing = Array.from(referencedEnvVars)
  .filter((name) => !definedVars.has(name))
  .sort();

if (missing.length > 0) {
  console.error(
    `Missing env vars in .env.example:\n- ${missing.join("\n- ")}`
  );
  process.exit(1);
}

console.log(
  `✅ ${referencedEnvVars.size} env vars referenced by Supabase functions are documented in .env.example.`
);
