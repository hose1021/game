import { useState, useEffect, useCallback } from 'react';
import { getDailyWord, getNextWordTime, isValidWord } from '../utils/words';

const MAX_ATTEMPTS = 6;

export function useWordle() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());
  const [correctKeys, setCorrectKeys] = useState<Set<string>>(new Set());
  const [presentKeys, setPresentKeys] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState('');
  const [showWinModal, setShowWinModal] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, currentStreak: 0, maxStreak: 0 });

  useEffect(() => {
    const dailyWord = getDailyWord();
    setWord(dailyWord);
    const savedGuesses = localStorage.getItem(`wordleGuesses_${dailyWord}`);
    if (savedGuesses) {
      const parsedGuesses = JSON.parse(savedGuesses);
      setGuesses(parsedGuesses);
      if (parsedGuesses.includes(dailyWord)) {
        setGameOver(true);
        setGameWon(true);
        setShowWinModal(true);
      }
    }
    const savedStats = localStorage.getItem('wordleStats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    updateTimer();
  }, []);

  useEffect(() => {
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTimer = () => {
    const nextWordTime = getNextWordTime();
    const now = new Date();
    const diff = nextWordTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setTimeUntilNextWord(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'Enter') {
      if (currentGuess.length !== 5) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        return;
      }

      if (!isValidWord(currentGuess)) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        alert('Bu söz siyahıda yoxdur!');
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      localStorage.setItem(`wordleGuesses_${word}`, JSON.stringify(newGuesses));
      updateKeyStates(currentGuess);
      setCurrentGuess('');

      if (currentGuess === word) {
        setGameOver(true);
        setGameWon(true);
        setShowWinModal(true);
        updateStats(true);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameOver(true);
        updateStats(false);
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key.toLowerCase());
    }
  }, [currentGuess, guesses, word, gameOver]);

  const updateKeyStates = (guess: string) => {
    const newCorrectKeys = new Set(correctKeys);
    const newPresentKeys = new Set(presentKeys);
    const newDisabledKeys = new Set(disabledKeys);

    guess.split('').forEach((letter, index) => {
      if (word[index] === letter) {
        newCorrectKeys.add(letter);
      } else if (word.includes(letter)) {
        newPresentKeys.add(letter);
      } else {
        newDisabledKeys.add(letter);
      }
    });

    setCorrectKeys(newCorrectKeys);
    setPresentKeys(newPresentKeys);
    setDisabledKeys(newDisabledKeys);
  };

  const updateStats = (won: boolean) => {
    const newStats = {
      played: stats.played + 1,
      won: stats.won + (won ? 1 : 0),
      currentStreak: won ? stats.currentStreak + 1 : 0,
      maxStreak: won ? Math.max(stats.currentStreak + 1, stats.maxStreak) : stats.maxStreak
    };
    setStats(newStats);
    localStorage.setItem('wordleStats', JSON.stringify(newStats));
    if (won) {
      setShowWinModal(true);
    }
  };

  return {
    word,
    guesses,
    currentGuess,
    gameOver,
    gameWon,
    disabledKeys,
    correctKeys,
    presentKeys,
    shake,
    timeUntilNextWord,
    showWinModal,
    stats,
    handleKeyPress,
    setShowWinModal,
  };
}