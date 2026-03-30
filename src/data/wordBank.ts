import type { Language, WordBank } from "../types/game";

const WORD_LIST_FILES = import.meta.glob("./{en,fr}/length*.txt", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const EMPTY_BANK: WordBank = {
  en: {},
  fr: {},
};

const wordListCache = new Map<string, string[]>();

function parseWordList(raw: string, expectedLength: number) {
  const words = raw
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter((word) => /^[a-z]+$/.test(word) && word.length === expectedLength);

  return Array.from(new Set(words));
}

function buildAvailableWordBank(): WordBank {
  const bank: WordBank = {
    en: {},
    fr: {},
  };

  for (const filePath of Object.keys(WORD_LIST_FILES)) {
    const match = filePath.match(/^\.\/(en|fr)\/length(\d+)\.txt$/);
    if (!match) {
      continue;
    }

    const language = match[1] as Language;
    const length = Number(match[2]);
    bank[language][length] = [];
  }

  return bank;
}

export const WORD_BANK: WordBank = buildAvailableWordBank();

export const LANGUAGES = Object.keys(WORD_BANK) as Language[];

export function getAvailableLengths(language: Language) {
  return Object.keys(WORD_BANK[language] ?? EMPTY_BANK[language])
    .map(Number)
    .sort((a, b) => a - b);
}

export async function loadWordList(language: Language, wordLength: number) {
  const filePath = `./${language}/length${wordLength}.txt`;
  const cached = wordListCache.get(filePath);
  if (cached) {
    return cached;
  }

  const fileLoader = WORD_LIST_FILES[filePath];
  if (!fileLoader) {
    throw new Error(
      `Word list not found for ${language} length ${wordLength}.`,
    );
  }

  const rawContent = await fileLoader();
  const parsed = parseWordList(rawContent, wordLength);
  wordListCache.set(filePath, parsed);
  return parsed;
}
