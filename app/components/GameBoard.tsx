import React from 'react';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  word: string;
  gameOver: boolean;
  // Удалим неиспользуемый проп 'shake'
}

interface LetterProps {
  letter: string;
  state: string;
}

const MAX_ATTEMPTS = 6;

export const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, word, gameOver }) => {
  const renderGuess = (guess: string, isCurrentGuess = false) => {
    return guess.split('').map((letter, index) => {
      let state = 'empty';
      if (!isCurrentGuess) {
        if (word[index] === letter) {
          state = 'correct';
        } else if (word.includes(letter)) {
          state = 'present';
        } else {
          state = 'absent';
        }
      }
      return <Letter key={index} letter={letter} state={state} />;
    });
  };

  const renderEmptyGuess = () => {
    return Array(5).fill('').map((_, index) => (
      <Letter key={index} letter="" state="empty" />
    ));
  };

  const Letter: React.FC<LetterProps> = ({ letter, state }) => {
    return (
      <div
        className={`letter w-full aspect-square flex items-center justify-center text-2xl font-bold border-2 ${
          state === 'correct' ? 'bg-wordle-correct text-white border-wordle-correct' :
          state === 'present' ? 'bg-wordle-present text-white border-wordle-present' :
          state === 'absent' ? 'bg-wordle-absent text-white border-wordle-absent' :
          'bg-transparent border-gray-300 dark:border-gray-600'
        }`}
      >
        {letter}
      </div>
    );
  };

  return (
    <div className={`game-board w-full max-w-sm mx-auto grid gap-1`}>
      {guesses.map((guess, index) => (
        <div key={index} className="grid grid-cols-5 gap-1">{renderGuess(guess)}</div>
      ))}
      {!gameOver && guesses.length < MAX_ATTEMPTS && (
        <div className="grid grid-cols-5 gap-1">
          {renderGuess(currentGuess.padEnd(5, ' '), true)}
        </div>
      )}
      {Array(MAX_ATTEMPTS - guesses.length - 1).fill(null).map((_, index) => (
        <div key={`empty-${index}`} className="grid grid-cols-5 gap-1">
          {renderEmptyGuess()}
        </div>
      ))}
    </div>
  );
}