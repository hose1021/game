import React from 'react';

const KEYS = [
  ['q', 'ü', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'ö', 'ğ'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ı', 'ə'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ç', 'ş']
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  disabledKeys: Set<string>;
  correctKeys: Set<string>;
  presentKeys: Set<string>;
}

export default function Keyboard({ onKeyPress, disabledKeys, correctKeys, presentKeys }: KeyboardProps) {
  const handleKeyPress = (key: string) => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onKeyPress(key);
  };

  return (
    <div className="keyboard max-w-lg w-full" role="group" aria-label="Klaviatura">
      {KEYS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-2">
          {rowIndex === 2 && <button className="key wide bg-gray-300 dark:bg-gray-600 animate-press" onClick={handleKeyPress('Enter')} onTouchStart={handleKeyPress('Enter')} aria-label="Daxil et">Enter</button>}
          {row.map((key) => (
            <button
              key={key}
              className={`key animate-press ${
                correctKeys.has(key) ? 'bg-wordle-correct text-white' :
                presentKeys.has(key) ? 'bg-wordle-present text-white' :
                disabledKeys.has(key) ? 'bg-wordle-absent text-white' : 
                'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
              } hover:bg-gray-300 dark:hover:bg-gray-600`}
              onClick={handleKeyPress(key)}
              onTouchStart={handleKeyPress(key)}
              aria-label={key}
              aria-pressed={disabledKeys.has(key)}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && <button className="key wide bg-gray-300 dark:bg-gray-600 animate-press" onClick={handleKeyPress('Backspace')} onTouchStart={handleKeyPress('Backspace')} aria-label="Sil">⌫</button>}
        </div>
      ))}
    </div>
  );
}