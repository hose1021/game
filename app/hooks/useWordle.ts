import { useState, useEffect, useCallback, useRef } from 'react';
import { getDailyWord, getNextWordTime, isValidWord } from '../utils/words';
import { usePracticeMode } from './usePracticeMode';

const MAX_ATTEMPTS = 6;

interface Stats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  streakDays: string[];
}

export function useWordle() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [disabledKeys, setDisabledKeys] = useState(new Set<string>());
  const [correctKeys, setCorrectKeys] = useState(new Set<string>());
  const [presentKeys, setPresentKeys] = useState(new Set<string>());
  const [shake, setShake] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState('');
  const [stats, setStats] = useState<Stats>({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(MAX_ATTEMPTS).fill(0),
    streakDays: []
  });
  const [dailyWordFound, setDailyWordFound] = useState(false);
  const [isPracticeMode, setIsPracticeMode] = useState(false);

  const wordRef = useRef(word);
  const guessesRef = useRef(guesses);
  wordRef.current = word;
  guessesRef.current = guesses;

  const practice = usePracticeMode();

  const updateKeyStates = useCallback((guess: string) => {
    const newCorrectKeys = new Set(correctKeys);
    const newPresentKeys = new Set(presentKeys);
    const newDisabledKeys = new Set(disabledKeys);
    const letterCounts: { [key: string]: number } = {};

    for (const letter of wordRef.current) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter === wordRef.current[i]) {
        newCorrectKeys.add(letter);
        letterCounts[letter]--;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter !== wordRef.current[i]) {
        if (letterCounts[letter] > 0) {
          newPresentKeys.add(letter);
          letterCounts[letter]--;
        } else {
          newDisabledKeys.add(letter);
        }
      }
    }

    setCorrectKeys(newCorrectKeys);
    setPresentKeys(newPresentKeys);
    setDisabledKeys(newDisabledKeys);
    localStorage.setItem('wordleKeyStates', JSON.stringify({
      correctKeys: Array.from(newCorrectKeys),
      presentKeys: Array.from(newPresentKeys),
      disabledKeys: Array.from(newDisabledKeys),
    }));
  }, [correctKeys, presentKeys, disabledKeys]);

  const loadKeyStates = useCallback(() => {
    const storedKeyStates = localStorage.getItem('wordleKeyStates');
    if (storedKeyStates) {
      const { correctKeys, presentKeys, disabledKeys } = JSON.parse(storedKeyStates);
      setCorrectKeys(new Set(correctKeys));
      setPresentKeys(new Set(presentKeys));
      setDisabledKeys(new Set(disabledKeys));
    }
  }, []);

  const initializeGame = useCallback(() => {
    const dailyWord = getDailyWord();
    const currentDate = new Date().toDateString();
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');

    if (lastPlayedDate !== currentDate) {
      setDisabledKeys(new Set());
      setCorrectKeys(new Set());
      setPresentKeys(new Set());
      localStorage.setItem('lastPlayedDate', currentDate);
      setDailyWordFound(false);
    } else {
      loadKeyStates();
    }

    const savedGuesses = localStorage.getItem(`wordleGuesses_daily_${currentDate}`);
    if (savedGuesses) {
      const parsedGuesses = JSON.parse(savedGuesses);
      setGuesses(parsedGuesses);
      setWord(dailyWord);
      setDailyWordFound(parsedGuesses.includes(dailyWord) && savedGuesses.length < MAX_ATTEMPTS);
      setGameOver(parsedGuesses.includes(dailyWord) || savedGuesses.length >= MAX_ATTEMPTS);
      setGameWon(parsedGuesses.includes(dailyWord) && savedGuesses.length < MAX_ATTEMPTS);
    } else {
      setWord(dailyWord);
    }
  }, [loadKeyStates]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextWordTime = getNextWordTime();
      const now = new Date();
      const diff = nextWordTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilNextWord(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateStats = useCallback((won: boolean, attempts: number) => {
    setStats((prevStats: Stats) => {
      const newStats = { ...prevStats, played: prevStats.played + 1 };
      if (won) {
        newStats.won += 1;
        newStats.currentStreak += 1;
        newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak);
        newStats.guessDistribution[attempts - 1] += 1;
        newStats.streakDays.push(new Date().toISOString().split('T')[0]);
      } else {
        newStats.currentStreak = 0;
      }
      localStorage.setItem('wordleStats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (isPracticeMode) {
      practice.handlePracticeKeyPress(key);
    } else {
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

        if (guessesRef.current.includes(currentGuess)) {
          setShake(true);
          setTimeout(() => setShake(false), 300);
          alert('Bu söz artıq istifadə olunub!');
          return;
        }

        const newGuesses = [...guessesRef.current, currentGuess].slice(0, MAX_ATTEMPTS);
        setGuesses(newGuesses);
        const currentDate = new Date().toDateString();
        localStorage.setItem(`wordleGuesses_daily_${currentDate}`, JSON.stringify(newGuesses));
        updateKeyStates(currentGuess);
        setCurrentGuess('');

        if (currentGuess === wordRef.current) {
          setGameOver(true);
          setGameWon(true);
          updateStats(true, newGuesses.length);
          setDailyWordFound(true);
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
          setGameOver(true);
          updateStats(false, newGuesses.length);
        }
      } else if (key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key.toLowerCase());
      }
    }
  }, [isPracticeMode, practice, gameOver, currentGuess, updateKeyStates, updateStats]);

  const togglePracticeMode = useCallback(() => {
    if (isPracticeMode) {
      // Возвращаемся к обычному режиму
      initializeGame();
    } else {
      // Переходим в режим практики
      practice.resetPracticeGame();
    }
    setIsPracticeMode(!isPracticeMode);
  }, [isPracticeMode, initializeGame, practice]);

  return {
    word: isPracticeMode ? practice.practiceWord : word,
    guesses: isPracticeMode ? practice.practiceGuesses : guesses,
    currentGuess: isPracticeMode ? practice.practiceCurrentGuess : currentGuess,
    gameOver: isPracticeMode ? practice.practiceGameOver : gameOver,
    gameWon: isPracticeMode ? practice.practiceGameWon : gameWon,
    disabledKeys: isPracticeMode ? practice.practiceDisabledKeys : disabledKeys,
    correctKeys: isPracticeMode ? practice.practiceCorrectKeys : correctKeys,
    presentKeys: isPracticeMode ? practice.practicePresentKeys : presentKeys,
    shake: isPracticeMode ? practice.practiceShake : shake,
    timeUntilNextWord,
    stats,
    handleKeyPress,
    dailyWordFound,
    initializeGame,
    isPracticeMode,
    togglePracticeMode,
    practiceStreak: practice.practiceStreak
  };
}
