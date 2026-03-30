import type { KeyboardState, TileState } from "../types/game";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
];

type OnScreenKeyboardProps = {
  keyboardState: KeyboardState;
  onKeyPress: (key: string) => void;
  disabled?: boolean;
};

function keyClass(key: string, state: TileState) {
  const baseClass = "h-11 rounded-md px-3 text-sm font-semibold transition";

  if (key === "ENTER" || key === "BACK") {
    return `${baseClass} min-w-14 bg-slate-300 text-slate-900`;
  }
  if (state === "correct") return `${baseClass} bg-emerald-500 text-white`;
  if (state === "present") return `${baseClass} bg-amber-500 text-white`;
  if (state === "absent") return `${baseClass} bg-slate-500 text-white`;

  return `${baseClass} bg-slate-200 text-slate-900`;
}

export function OnScreenKeyboard({ keyboardState, onKeyPress, disabled = false }: OnScreenKeyboardProps) {
  return (
    <section className="w-full rounded-2xl bg-white/70 p-4 shadow-lg">
      <div className="mx-auto flex max-w-xl flex-col gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={`keyboard-row-${rowIndex}`} className="flex justify-center gap-1">
            {row.map((key) => {
              const state = keyboardState[key.toLowerCase()] ?? "empty";

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onKeyPress(key)}
                  className={keyClass(key, state)}
                >
                  {key === "BACK" ? "DEL" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
