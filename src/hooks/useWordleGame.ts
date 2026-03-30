import { useCallback, useEffect, useMemo, useState } from "react";
import { getAvailableLengths, loadWordList } from "../data/wordBank";
import {
  evaluateGuess,
  getAttemptsForLength,
  getDailyWord,
  getDaySeed,
  STATE_PRIORITY,
} from "../lib/gameLogic";
import type {
  BoardRow,
  GameState,
  KeyboardState,
  Language,
  TileState,
} from "../types/game";

export function useGame() {
  const [language, setLanguage] = useState<Language>("en");
  const [wordLength, setWordLength] = useState<number>(5);
  const [answer, setAnswer] = useState<string>("");
  const [activeWords, setActiveWords] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameState, setGameState] = useState<GameState>("playing");
  const [message, setMessage] = useState<string>("");
  const [isLoadingWords, setIsLoadingWords] = useState<boolean>(true);
  const [wordLoadError, setWordLoadError] = useState<string>("");

  const daySeed = useMemo(() => getDaySeed(new Date()), []);

  const availableLengths = useMemo(
    () => getAvailableLengths(language),
    [language],
  );
  const maxAttempts = useMemo(
    () => getAttemptsForLength(wordLength),
    [wordLength],
  );

  const activeWordSet = useMemo(() => new Set(activeWords), [activeWords]);

  const evaluations = useMemo(
    () => guesses.map((guess) => evaluateGuess(guess, answer)),
    [guesses, answer],
  );

  const keyboardState = useMemo<KeyboardState>(() => {
    const keyState: KeyboardState = {};

    guesses.forEach((guess, rowIndex) => {
      const rowEvaluation = evaluations[rowIndex];

      guess.split("").forEach((char, index) => {
        const nextState = rowEvaluation[index];
        const currentState = keyState[char] ?? "empty";

        if (STATE_PRIORITY[nextState] > STATE_PRIORITY[currentState]) {
          keyState[char] = nextState;
        }
      });
    });

    return keyState;
  }, [guesses, evaluations]);

  const resetBoard = useCallback(() => {
    setGuesses([]);
    setCurrentGuess("");
    setGameState("playing");
    setMessage("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadWordsForSelection() {
      setIsLoadingWords(true);
      setWordLoadError("");
      setMessage("Loading words...");

      try {
        const words = await loadWordList(language, wordLength);
        if (cancelled) {
          return;
        }

        const seedKey = `${daySeed}:${language}:${wordLength}`;
        setActiveWords(words);
        setAnswer(getDailyWord(words, seedKey));
        setMessage("");
      } catch {
        if (cancelled) {
          return;
        }

        setActiveWords([]);
        setAnswer("");
        setWordLoadError("Could not load words for this language and length.");
        setMessage("Could not load words for this language and length.");
      } finally {
        if (!cancelled) {
          setIsLoadingWords(false);
        }
      }
    }

    loadWordsForSelection();

    return () => {
      cancelled = true;
    };
  }, [daySeed, language, wordLength]);

  const submitGuess = useCallback(() => {
    if (gameState !== "playing") {
      return;
    }

    if (isLoadingWords || wordLoadError || !answer) {
      setMessage(wordLoadError || "Words are still loading. Please wait.");
      return;
    }

    if (currentGuess.length !== wordLength) {
      setMessage(`Word must be ${wordLength} letters.`);
      return;
    }

    if (!activeWordSet.has(currentGuess)) {
      setMessage("Word not found in selected language list.");
      return;
    }

    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");

    if (currentGuess === answer) {
      setGameState("won");
      setMessage("Nice! You solved today's word.");
      return;
    }

    if (nextGuesses.length >= maxAttempts) {
      setGameState("lost");
      setMessage(`No more tries. Today's word was ${answer.toUpperCase()}.`);
      return;
    }

    setMessage("");
  }, [
    activeWordSet,
    answer,
    currentGuess,
    gameState,
    guesses,
    isLoadingWords,
    maxAttempts,
    wordLength,
    wordLoadError,
  ]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameState !== "playing") {
        return;
      }

      if (isLoadingWords || wordLoadError) {
        return;
      }

      if (key === "ENTER") {
        submitGuess();
        return;
      }

      if (key === "BACK" || key === "Backspace") {
        setCurrentGuess((value) => value.slice(0, -1));
        return;
      }

      if (!/^[a-zA-Z]$/.test(key)) {
        return;
      }

      const normalizedKey = key.toLowerCase();
      setCurrentGuess((value) => {
        if (value.length >= wordLength) {
          return value;
        }

        return `${value}${normalizedKey}`;
      });
    },
    [gameState, isLoadingWords, submitGuess, wordLength, wordLoadError],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleKeyPress("ENTER");
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        handleKeyPress("Backspace");
        return;
      }

      handleKeyPress(event.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKeyPress]);

  const changeLanguage = useCallback(
    (nextLanguage: Language) => {
      const lengths = getAvailableLengths(nextLanguage);
      const nextLength = lengths.includes(wordLength) ? wordLength : lengths[0];

      setLanguage(nextLanguage);
      setWordLength(nextLength);
      resetBoard();
    },
    [resetBoard, wordLength],
  );

  const changeWordLength = useCallback(
    (nextWordLength: number) => {
      setWordLength(nextWordLength);
      resetBoard();
    },
    [resetBoard],
  );

  const rows = useMemo<BoardRow[]>(() => {
    return Array.from({ length: maxAttempts }, (_, rowIndex) => {
      if (rowIndex < guesses.length) {
        return {
          letters: guesses[rowIndex].split(""),
          states: evaluations[rowIndex],
        };
      }

      if (rowIndex === guesses.length && gameState === "playing") {
        const letters = currentGuess.padEnd(wordLength, " ").split("");
        return {
          letters,
          states: letters.map(() => "empty" as TileState),
        };
      }

      return {
        letters: Array.from({ length: wordLength }, () => " "),
        states: Array.from({ length: wordLength }, () => "empty" as TileState),
      };
    });
  }, [currentGuess, evaluations, gameState, guesses, maxAttempts, wordLength]);

  return {
    language,
    wordLength,
    maxAttempts,
    message,
    rows,
    keyboardState,
    availableLengths,
    daySeed,
    gameState,
    isLoadingWords,
    changeLanguage,
    changeWordLength,
    handleKeyPress,
    resetBoard,
  };
}
