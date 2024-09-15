import { useState, useEffect, useCallback } from 'react';
import { getDailyWord, getNextWordTime, isValidWord, getRandomWord } from '../utils/words';

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
  const [stats, setStats] = useState({ 
    played: 0, 
    won: 0, 
    currentStreak: 0, 
    maxStreak: 0, 
    guessDistribution: [0, 0, 0, 0, 0, 0],
    streakDays: [] as string[]
  });
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [dailyWordFound, setDailyWordFound] = useState(false);

  const updateKeyStates = useCallback((guess: string) => {
    setCorrectKeys(prevCorrectKeys => {
      const newCorrectKeys = new Set(prevCorrectKeys);
      guess.split('').forEach((letter, index) => {
        if (word[index] === letter) {
          newCorrectKeys.add(letter);
        }
      });
      return newCorrectKeys;
    });

    setPresentKeys(prevPresentKeys => {
      const newPresentKeys = new Set(prevPresentKeys);
      guess.split('').forEach((letter) => {
        if (word.includes(letter) && word[guess.indexOf(letter)] !== letter) {
          newPresentKeys.add(letter);
        }
      });
      return newPresentKeys;
    });

    setDisabledKeys(prevDisabledKeys => {
      const newDisabledKeys = new Set(prevDisabledKeys);
      guess.split('').forEach((letter) => {
        if (!word.includes(letter)) {
          newDisabledKeys.add(letter);
        }
      });
      return newDisabledKeys;
    });

    localStorage.setItem('wordleKeyStates', JSON.stringify({
      correctKeys: Array.from(correctKeys),
      presentKeys: Array.from(presentKeys),
      disabledKeys: Array.from(disabledKeys)
    }));
  }, [word]);

  const loadKeyStates = useCallback(() => {
    const storedKeyStates = localStorage.getItem('wordleKeyStates');
    if (storedKeyStates) {
      const { correctKeys, presentKeys, disabledKeys } = JSON.parse(storedKeyStates);
      setCorrectKeys(new Set(correctKeys));
      setPresentKeys(new Set(presentKeys));
      setDisabledKeys(new Set(disabledKeys));
    }
  }, []);

  useEffect(() => {
    const dailyWord = getDailyWord();
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const currentDate = new Date().toDateString();
    const savedGuesses = localStorage.getItem(`wordleGuesses_${dailyWord}`);

    if (lastPlayedDate !== currentDate) {
      setDisabledKeys(new Set());
      setCorrectKeys(new Set());
      setPresentKeys(new Set());
      localStorage.removeItem('wordleKeyStates');
      localStorage.setItem('lastPlayedDate', currentDate);
      setDailyWordFound(false);
    } else {
      loadKeyStates();
    }

    if (savedGuesses) {
      const parsedGuesses = JSON.parse(savedGuesses);
      setGuesses(parsedGuesses);
      if (parsedGuesses.includes(dailyWord)) {
        setDailyWordFound(true);
        setIsPracticeMode(true);
        setWord(getRandomWord());
      } else {
        setWord(dailyWord);
      }
      parsedGuesses.forEach(updateKeyStates);
    } else {
      setWord(dailyWord);
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

  const updateStats = useCallback((won: boolean, attempts: number) => {
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
  }, []);

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

      // Проверка на повторение слова
      if (guesses.includes(currentGuess)) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        alert('Bu söz artıq istifadə olunub!');
        return;
      }
      
      const newGuesses = [...guesses, currentGuess].slice(0, MAX_ATTEMPTS);
      setGuesses(newGuesses);
      if (!isPracticeMode) {
        localStorage.setItem(`wordleGuesses_${word}`, JSON.stringify(newGuesses));
      }
      updateKeyStates(currentGuess);
      setCurrentGuess('');

      if (currentGuess === word) {
        setGameOver(true);
        setGameWon(true);
        if (isPracticeMode) {
          setPracticeStreak(prev => prev + 1);
        } else {
          updateStats(true, newGuesses.length);
          setDailyWordFound(true);
        }
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameOver(true);
        if (isPracticeMode) {
          setPracticeStreak(0);
        } else {
          updateStats(false, newGuesses.length);
        }
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key.toLowerCase());
    }
  }, [currentGuess, guesses, word, gameOver, updateKeyStates, updateStats, isPracticeMode]);

  const togglePracticeMode = useCallback(() => {
    if (isPracticeMode) {
      setIsPracticeMode(false);
      setPracticeStreak(0);
      const dailyWord = getDailyWord();
      setWord(dailyWord);
      const savedGuesses = localStorage.getItem(`wordleGuesses_${dailyWord}`);
      if (savedGuesses) {
        setGuesses(JSON.parse(savedGuesses));
        // Проверяем, не закончена ли уже ежедневная игра
        const parsedGuesses = JSON.parse(savedGuesses);
        setGameOver(parsedGuesses.includes(dailyWord));
        setGameWon(parsedGuesses.includes(dailyWord));
      } else {
        setGuesses([]);
        setGameOver(false);
        setGameWon(false);
      }
    } else {
      setIsPracticeMode(true);
      setPracticeStreak(0);
      setWord(getRandomWord());
      setGuesses([]);
      setGameOver(false);
      setGameWon(false);
    }
    setCurrentGuess('');
    setDisabledKeys(new Set());
    setCorrectKeys(new Set());
    setPresentKeys(new Set());
  }, [isPracticeMode]);

  useEffect(() => {
    if (isPracticeMode && gameOver && gameWon) {
      const timer = setTimeout(() => {
        setWord(getRandomWord());
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setGameWon(false);
        setDisabledKeys(new Set());
        setCorrectKeys(new Set());
        setPresentKeys(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isPracticeMode, gameOver, gameWon]);

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
    stats,
    handleKeyPress,
    isPracticeMode,
    togglePracticeMode,
    practiceStreak,
    dailyWordFound,
  };
}