import type { TileState } from "../types/game";

export const STATE_PRIORITY: Record<TileState, number> = {
  empty: 0,
  absent: 1,
  present: 2,
  correct: 3,
};

export function getAttemptsForLength(length: number) {
  return length + 1;
}

export function evaluateGuess(guess: string, answer: string): TileState[] {
  const result: TileState[] = Array.from({ length: guess.length }, () => "absent");
  const remainingChars = new Map<string, number>();

  for (let index = 0; index < answer.length; index += 1) {
    if (guess[index] === answer[index]) {
      result[index] = "correct";
      continue;
    }

    const char = answer[index];
    remainingChars.set(char, (remainingChars.get(char) ?? 0) + 1);
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index] === "correct") {
      continue;
    }

    const char = guess[index];
    const remaining = remainingChars.get(char) ?? 0;
    if (remaining > 0) {
      result[index] = "present";
      remainingChars.set(char, remaining - 1);
    }
  }

  return result;
}

function fnv1aHash(input: string) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

export function getDaySeed(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyWord(words: string[], seedKey: string) {
  if (words.length === 0) {
    throw new Error("Cannot pick a daily word from an empty list.");
  }

  const hash = fnv1aHash(seedKey);
  return words[hash % words.length];
}
