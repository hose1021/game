import React, { useMemo } from 'react';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  word: string;
  gameOver: boolean;
}

interface RowProps {
  guess: string;
  word: string;
  current?: boolean;
}

const Row: React.FC<RowProps> = ({ guess, word, current = false }) => {
  const tiles = useMemo(() => {
    const letterCounts: { [key: string]: number } = {};
    for (const letter of word) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    const statuses = new Array(5).fill('empty');

    for (let i = 0; i < 5; i++) {
      if (guess[i] === word[i] && guess !== '') {
        statuses[i] = 'correct';
        letterCounts[guess[i]]--;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (statuses[i] === 'empty') {
        const guessedLetter = guess[i];
        if (letterCounts[guessedLetter] > 0) {
          statuses[i] = 'present';
          letterCounts[guessedLetter]--;
        } else {
          statuses[i] = 'absent';
        }
      }
    }

    return statuses.map((status, i) => (
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
        {guess[i] ? guess[i].toUpperCase() : ''}
      </div>
    ));
  }, [guess, word, current]);

  return <div className="flex gap-1">{tiles}</div>;
};

const MemoizedRow = React.memo(Row);

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, word, gameOver }) => {
  const emptyRows = 6 - guesses.length - (gameOver ? 0 : 1);

  return (
    <div className="grid grid-rows-6 gap-1">
      {guesses.map((guess, i) => (
        <MemoizedRow key={i} guess={guess} word={word} />
      ))}
      {!gameOver && <MemoizedRow guess={currentGuess} word={word} current />}
      {Array.from({ length: Math.max(0, emptyRows) }).map((_, i) => (
        <MemoizedRow key={`empty-${i}`} guess="" word={word} />
      ))}
    </div>
  );
};

export default GameBoard;
