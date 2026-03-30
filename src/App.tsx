import { GameBoard } from "./components/GameBoard";
import { GameControls } from "./components/GameControls";
import { OnScreenKeyboard } from "./components/OnScreenKeyboard";
import { LANGUAGES } from "./data/wordBank.ts";
import { useGame } from "./hooks/useWordleGame";

function App() {
  const {
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
  } = useGame();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-sky-100 to-cyan-100 p-4 text-slate-900">
      <main className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <h1 className="text-4xl font-black tracking-wide">Hurdle</h1>

        <p className="text-sm text-slate-700">Daily seed: {daySeed}</p>

        <GameControls
          language={language}
          wordLength={wordLength}
          maxAttempts={maxAttempts}
          message={message}
          isLoading={isLoadingWords}
          availableLanguages={LANGUAGES}
          availableLengths={availableLengths}
          onLanguageChange={changeLanguage}
          onWordLengthChange={changeWordLength}
          onResetBoard={resetBoard}
        />

        <GameBoard rows={rows} wordLength={wordLength} />

        <OnScreenKeyboard
          keyboardState={keyboardState}
          onKeyPress={handleKeyPress}
          disabled={isLoadingWords}
        />

        <p className="text-sm font-medium uppercase tracking-wide text-slate-700">
          Status: {isLoadingWords ? "loading words" : gameState}
        </p>
      </main>
    </div>
  );
}

export default App;
