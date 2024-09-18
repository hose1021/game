import { useState, useCallback } from 'react';
import { getRandomWord, isValidWord } from '../utils/words';

const MAX_ATTEMPTS = 6;

export function usePracticeMode() {
  const [practiceWord, setPracticeWord] = useState(getRandomWord());
  const [practiceGuesses, setPracticeGuesses] = useState<string[]>([]);
  const [practiceCurrentGuess, setPracticeCurrentGuess] = useState('');
  const [practiceGameOver, setPracticeGameOver] = useState(false);
  const [practiceGameWon, setPracticeGameWon] = useState(false);
  const [practiceDisabledKeys, setPracticeDisabledKeys] = useState(new Set<string>());
  const [practiceCorrectKeys, setPracticeCorrectKeys] = useState(new Set<string>());
  const [practicePresentKeys, setPracticePresentKeys] = useState(new Set<string>());
  const [practiceShake, setPracticeShake] = useState(false);
  const [practiceStreak, setPracticeStreak] = useState(0);

  const updatePracticeKeyStates = useCallback((guess: string) => {
    const newCorrectKeys = new Set(practiceCorrectKeys);
    const newPresentKeys = new Set(practicePresentKeys);
    const newDisabledKeys = new Set(practiceDisabledKeys);
    const letterCounts: { [key: string]: number } = {};

    for (const letter of practiceWord) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter === practiceWord[i]) {
        newCorrectKeys.add(letter);
        letterCounts[letter]--;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter !== practiceWord[i]) {
        if (letterCounts[letter] > 0) {
          newPresentKeys.add(letter);
          letterCounts[letter]--;
        } else {
          newDisabledKeys.add(letter);
        }
      }
    }

    setPracticeCorrectKeys(newCorrectKeys);
    setPracticePresentKeys(newPresentKeys);
    setPracticeDisabledKeys(newDisabledKeys);
  }, [practiceWord, practiceCorrectKeys, practicePresentKeys, practiceDisabledKeys]);

  const handlePracticeKeyPress = useCallback((key: string) => {
    if (practiceGameOver) return;

    if (key === 'Enter') {
      if (practiceCurrentGuess.length !== 5) {
        setPracticeShake(true);
        setTimeout(() => setPracticeShake(false), 300);
        return;
      }

      if (!isValidWord(practiceCurrentGuess)) {
        setPracticeShake(true);
        setTimeout(() => setPracticeShake(false), 300);
        alert('Bu söz siyahıda yoxdur!');
        return;
      }

      if (practiceGuesses.includes(practiceCurrentGuess)) {
        setPracticeShake(true);
        setTimeout(() => setPracticeShake(false), 300);
        alert('Bu söz artıq istifadə olunub!');
        return;
      }

      const newGuesses = [...practiceGuesses, practiceCurrentGuess].slice(0, MAX_ATTEMPTS);
      setPracticeGuesses(newGuesses);
      updatePracticeKeyStates(practiceCurrentGuess);
      setPracticeCurrentGuess('');

      if (practiceCurrentGuess === practiceWord) {
        setPracticeGameOver(true);
        setPracticeGameWon(true);
        setPracticeStreak(prev => prev + 1);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setPracticeGameOver(true);
        setPracticeStreak(0);
      }
    } else if (key === 'Backspace') {
      setPracticeCurrentGuess(prev => prev.slice(0, -1));
    } else if (practiceCurrentGuess.length < 5) {
      setPracticeCurrentGuess(prev => prev + key.toLowerCase());
    }
  }, [practiceCurrentGuess, practiceGameOver, practiceGuesses, practiceWord, updatePracticeKeyStates]);

  const resetPracticeGame = useCallback(() => {
    setPracticeWord(getRandomWord());
    setPracticeGuesses([]);
    setPracticeCurrentGuess('');
    setPracticeGameOver(false);
    setPracticeGameWon(false);
    setPracticeDisabledKeys(new Set());
    setPracticeCorrectKeys(new Set());
    setPracticePresentKeys(new Set());
  }, []);

  return {
    practiceWord,
    practiceGuesses,
    practiceCurrentGuess,
    practiceGameOver,
    practiceGameWon,
    practiceDisabledKeys,
    practiceCorrectKeys,
    practicePresentKeys,
    practiceShake,
    practiceStreak,
    handlePracticeKeyPress,
    resetPracticeGame,
  };
}