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
      let className = 'letter';
      if (!isCurrentGuess) {
        if (word[index] === letter) {
          className += ' bg-wordle-correct text-white animate-flip';
        } else if (word.includes(letter)) {
          className += ' bg-wordle-present text-white animate-flip';
        } else {
          className += ' bg-wordle-absent text-white animate-flip';
        }
      }
      return <span key={index} className={className}>{letter}</span>;
    });
  };

  const renderEmptyGuess = () => {
    return Array(5).fill('').map((_, index) => (
      <span key={index} className="letter"></span>
    ));
  };

  return (
    <div className={`game-board grid gap-1 mb-8 ${shake ? 'animate-shake' : ''}`}>
      {guesses.map((guess, index) => (
        <div key={index} className="flex gap-1">{renderGuess(guess)}</div>
      ))}
      {!gameOver && guesses.length < MAX_ATTEMPTS && (
        <div className="flex gap-1">
          {renderGuess(currentGuess.padEnd(5, ' '), true)}
        </div>
      )}
      {Array(MAX_ATTEMPTS - guesses.length - 1).fill(null).map((_, index) => (
        <div key={`empty-${index}`} className="flex gap-1">
          {renderEmptyGuess()}
        </div>
      ))}
    </div>
  );
}