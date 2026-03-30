import { mkdir, writeFile } from "node:fs/promises";

const SOURCES = {
  en: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt",
  fr: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/fr/fr_50k.txt",
};

const MIN_LENGTH = 4;
const MAX_LENGTH = 10;

function normalizeWord(rawWord) {
  return rawWord
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

async function buildLanguageFiles(language, sourceUrl) {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${language} source: ${response.status}`,
    );
  }

  const text = await response.text();
  const lines = text.split(/\r?\n/);

  const buckets = new Map();
  const seen = new Map();

  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length += 1) {
    buckets.set(length, []);
    seen.set(length, new Set());
  }

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const sourceWord = line.split(/\s+/)[0];
    if (!sourceWord) {
      continue;
    }

    const normalized = normalizeWord(sourceWord);
    const length = normalized.length;

    if (length < MIN_LENGTH || length > MAX_LENGTH) {
      continue;
    }

    if (!/^[a-z]+$/.test(normalized)) {
      continue;
    }

    const languageSeen = seen.get(length);
    if (languageSeen.has(normalized)) {
      continue;
    }

    languageSeen.add(normalized);
    buckets.get(length).push(normalized);
  }

  const outDir = new URL(`../src/data/${language}/`, import.meta.url);
  await mkdir(outDir, { recursive: true });

  for (let length = MIN_LENGTH; length <= MAX_LENGTH; length += 1) {
    const words = buckets.get(length);
    const outFile = new URL(`length${length}.txt`, outDir);
    await writeFile(outFile, `${words.join("\n")}\n`, "utf8");
  }
}

async function main() {
  for (const [language, sourceUrl] of Object.entries(SOURCES)) {
    await buildLanguageFiles(language, sourceUrl);
  }

  console.log("Word lists updated for languages en and fr.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
