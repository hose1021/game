import { useState, useEffect, useCallback } from 'react';
import { getDailyWord, getNextWordTime, isValidWord, getRandomWord } from '../utils/words';

const MAX_ATTEMPTS = 6;

export const useWordle = (isPracticeMode: boolean) => {
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
  const [stats, setStats] = useState({ 
    played: 0, 
    won: 0, 
    currentStreak: 0, 
    maxStreak: 0, 
    guessDistribution: [0, 0, 0, 0, 0, 0],
    streakDays: [] as string[]
  });

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
      // Восстанавливаем состояние клавиш
      parsedGuesses.forEach((guess: string) => {
        updateKeyStates(guess);
      });
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
        updateStats(true, newGuesses.length);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameOver(true);
        updateStats(false, newGuesses.length);
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

    // Сохраняем состояние клавиш в localStorage
    localStorage.setItem('wordleKeyStates', JSON.stringify({
      correctKeys: Array.from(newCorrectKeys),
      presentKeys: Array.from(newPresentKeys),
      disabledKeys: Array.from(newDisabledKeys)
    }));
  };

  const updateStats = (won: boolean, attempts: number) => {
    if (!isPracticeMode) {
      setStats(prevStats => {
        const newStats = {
          ...prevStats,
          played: prevStats.played + 1,
          won: won ? prevStats.won + 1 : prevStats.won,
          currentStreak: won ? prevStats.currentStreak + 1 : 0,
          maxStreak: won ? Math.max(prevStats.maxStreak, prevStats.currentStreak + 1) : prevStats.maxStreak,
          guessDistribution: [...prevStats.guessDistribution],
          streakDays: [...prevStats.streakDays]
        };
        if (won) {
          newStats.guessDistribution[attempts - 1]++;
          const today = new Date().toISOString().split('T')[0];
          newStats.streakDays.push(today);
        }
        localStorage.setItem('wordleStats', JSON.stringify(newStats));
        return newStats;
      });
    }
  };

  const resetGame = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setDisabledKeys(new Set());
    setCorrectKeys(new Set());
    setPresentKeys(new Set());
    setShake(false);
    setShowWinModal(false);
    if (isPracticeMode) {
      setWord(getRandomWord());
    } else {
      setWord(getDailyWord());
    }
  };

  const loadKeyStates = useCallback(() => {
    const savedKeyStates = localStorage.getItem('wordleKeyStates');
    if (savedKeyStates) {
      const { correctKeys, presentKeys, disabledKeys } = JSON.parse(savedKeyStates);
      setCorrectKeys(new Set(correctKeys));
      setPresentKeys(new Set(presentKeys));
      setDisabledKeys(new Set(disabledKeys));
    }
  }, []);

  useEffect(() => {
    loadKeyStates();
  }, [loadKeyStates]);

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
    resetGame,
    loadKeyStates,
  };
}