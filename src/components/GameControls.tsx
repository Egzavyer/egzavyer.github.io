import type { Language } from "../types/game";

type GameControlsProps = {
  language: Language;
  wordLength: number;
  maxAttempts: number;
  message: string;
  isLoading: boolean;
  availableLanguages: Language[];
  availableLengths: number[];
  onLanguageChange: (language: Language) => void;
  onWordLengthChange: (length: number) => void;
  onResetBoard: () => void;
};

const LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  fr: "Francais",
};

export function GameControls({
  language,
  wordLength,
  maxAttempts,
  message,
  isLoading,
  availableLanguages,
  availableLengths,
  onLanguageChange,
  onWordLengthChange,
  onResetBoard,
}: GameControlsProps) {
  return (
    <section className="w-full rounded-2xl bg-white/80 p-4 shadow-lg">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Language
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={language}
            disabled={isLoading}
            onChange={(event) => onLanguageChange(event.target.value as Language)}
          >
            {availableLanguages.map((value) => (
              <option key={value} value={value}>
                {LANGUAGE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Word Length
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={wordLength}
            disabled={isLoading}
            onChange={(event) => onWordLengthChange(Number(event.target.value))}
          >
            {availableLengths.map((length) => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          disabled={isLoading}
          onClick={onResetBoard}
        >
          Reset Board
        </button>
      </div>

      <p className="mt-3 text-sm text-slate-700">
        Tries: {maxAttempts} for {wordLength}-letter words
      </p>
      <p className="mt-1 min-h-6 text-sm font-medium">{message}</p>
    </section>
  );
}
