import { readdir, readFile } from "fs/promises";

const FUNCTIONS_DIR = "supabase/functions";
const DOC_PATH = "docs/supabase-functions-flow.md";

const entries = await readdir(FUNCTIONS_DIR, { withFileTypes: true });
const functionNames = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const docContent = await readFile(DOC_PATH, "utf8");

const missing = functionNames.filter(
  (name) => !docContent.includes(`\`${name}\``)
);

if (missing.length > 0) {
  console.error(
    `Missing functions in ${DOC_PATH}:\n- ${missing.join("\n- ")}`
  );
  process.exit(1);
}

console.log(
  `✅ ${functionNames.length} functions accounted for in ${DOC_PATH}.`
);
