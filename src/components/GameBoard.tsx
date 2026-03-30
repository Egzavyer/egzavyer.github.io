import type { BoardRow, TileState } from "../types/game";

type GameBoardProps = {
  rows: BoardRow[];
  wordLength: number;
};

function tileClassForState(state: TileState) {
  if (state === "correct") return "border-emerald-500 bg-emerald-500 text-white";
  if (state === "present") return "border-amber-500 bg-amber-500 text-white";
  if (state === "absent") return "border-slate-500 bg-slate-500 text-white";
  return "border-slate-300 bg-white text-slate-900";
}

export function GameBoard({ rows, wordLength }: GameBoardProps) {
  return (
    <section className="w-full rounded-2xl bg-white/70 p-4 shadow-lg">
      <div className="mx-auto grid w-fit gap-2">
        {rows.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}
          >
            {row.letters.map((letter, colIndex) => (
              <div
                key={`tile-${rowIndex}-${colIndex}`}
                className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-xl font-bold uppercase transition ${tileClassForState(
                  row.states[colIndex],
                )}`}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
