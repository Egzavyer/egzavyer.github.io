export type Language = "en" | "fr";

export type TileState = "empty" | "correct" | "present" | "absent";

export type GameState = "playing" | "won" | "lost";

export type KeyboardState = Record<string, TileState>;

export type BoardRow = {
  letters: string[];
  states: TileState[];
};

export type WordBank = Record<Language, Record<number, string[]>>;
