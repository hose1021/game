import React from 'react';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  shake: boolean;
  word: string;
  gameOver: boolean;
}

const MAX_ATTEMPTS = 6;

export function GameBoard({ guesses, currentGuess, shake, word, gameOver }: GameBoardProps) {
  const renderGuess = (guess: string, isCurrentGuess = false) => {
    return guess.split('').map((letter, index) => {
      let className = 'letter w-full aspect-square';
      if (!isCurrentGuess) {
        if (word[index] === letter) {
          className += ' bg-wordle-correct text-white animate-flip';
        } else if (word.includes(letter)) {
          className += ' bg-wordle-present text-white animate-flip';
        } else {
          className += ' bg-wordle-absent text-white animate-flip';
        }
      }
      return <div key={index} className={className}>{letter}</div>;
    });
  };

  const renderEmptyGuess = () => {
    return Array(5).fill('').map((_, index) => (
      <div key={index} className="letter w-full aspect-square"></div>
    ));
  };

  return (
    <div className={`game-board w-full max-w-sm mx-auto grid gap-1 ${shake ? 'animate-shake' : ''}`}>
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