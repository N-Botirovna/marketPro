#!/usr/bin/env node
/**
 * check-i18n.mjs — compare key sets across src/messages/{uz,ru,en}.json.
 *
 * Run via `npm run i18n:check`. Exits non-zero if any locale is missing a key
 * present in another. Used by CI to keep translations in sync.
 *
 * `uz` is the default locale (most complete by convention), but the script
 * is locale-symmetric: a key missing in any one of the three is a failure.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(__dirname, "../src/messages");
const LOCALES = ["uz", "ru", "en"];

function flattenKeys(obj, prefix = "") {
  const out = [];
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...flattenKeys(value, next));
    } else {
      out.push(next);
    }
  }
  return out;
}

async function loadLocale(locale) {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const data = {};
  for (const locale of LOCALES) {
    try {
      data[locale] = new Set(flattenKeys(await loadLocale(locale)));
    } catch (err) {
      console.error(`[i18n:check] failed to load ${locale}.json:`, err.message);
      process.exit(2);
    }
  }

  const union = new Set();
  for (const set of Object.values(data)) {
    for (const key of set) union.add(key);
  }

  const missing = {};
  for (const locale of LOCALES) {
    const gaps = [...union].filter((key) => !data[locale].has(key)).sort();
    if (gaps.length) missing[locale] = gaps;
  }

  if (Object.keys(missing).length === 0) {
    const sample = data[LOCALES[0]].size;
    console.log(`[i18n:check] OK — all ${LOCALES.length} locales have ${sample} keys in sync.`);
    process.exit(0);
  }

  console.error("[i18n:check] FAIL — locale key drift detected:\n");
  for (const [locale, keys] of Object.entries(missing)) {
    console.error(`  ${locale}.json is missing ${keys.length} key(s):`);
    for (const key of keys.slice(0, 20)) console.error(`    - ${key}`);
    if (keys.length > 20) console.error(`    ... and ${keys.length - 20} more`);
    console.error("");
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("[i18n:check] crashed:", err);
  process.exit(2);
});
