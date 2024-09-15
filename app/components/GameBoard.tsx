import React from 'react';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  word: string;
  gameOver: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, word, gameOver }) => {
  const emptyRows = 6 - guesses.length - (gameOver ? 0 : 1);

  return (
    <div className="grid grid-rows-6 gap-1">
      {guesses.map((guess, i) => (
        <Row key={i} guess={guess} word={word} />
      ))}
      {!gameOver && <Row guess={currentGuess} word={word} current />}
      {Array.from({ length: Math.max(0, emptyRows) }).map((_, i) => (
        <Row key={`empty-${i}`} guess="" word={word} />
      ))}
    </div>
  );
};

interface RowProps {
  guess: string;
  word: string;
  current?: boolean;
}

const Row: React.FC<RowProps> = ({ guess, word, current = false }) => {
  const tiles = [];

  for (let i = 0; i < 5; i++) {
    const letter = guess[i];
    let status = 'empty';

    if (letter) {
      if (word[i] === letter) {
        status = 'correct';
      } else if (word.includes(letter)) {
        status = 'present';
      } else {
        status = 'absent';
      }
    }

    tiles.push(
      <div
        key={i}
        className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold rounded
          ${current
            ? 'border-gray-400 dark:border-gray-500'
            : status === 'correct'
            ? 'bg-wordle-correct border-wordle-correct text-white'
            : status === 'present'
            ? 'bg-wordle-present border-wordle-present text-white'
            : status === 'absent'
            ? 'bg-wordle-absent border-wordle-absent text-white'
            : 'border-gray-300 dark:border-gray-600'
          }`}
      >
        {letter ? letter.toUpperCase() : ''}
      </div>
    );
  }

  return <div className="flex gap-1">{tiles}</div>;
};