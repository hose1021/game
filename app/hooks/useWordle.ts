import { useState, useEffect, useCallback, useRef } from 'react';
import { getDailyWord, getNextWordTime, isValidWord, getRandomWord } from '../utils/words';

const MAX_ATTEMPTS = 6;

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
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem('wordleStats') || JSON.stringify({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array(MAX_ATTEMPTS).fill(0),
    streakDays: [] as string[]
  })));
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const [dailyWordFound, setDailyWordFound] = useState(false);

  // Отдельные состояния для практического режима
  const [practiceWord, setPracticeWord] = useState('');
  const [practiceGuesses, setPracticeGuesses] = useState<string[]>([]);
  const [practiceDisabledKeys, setPracticeDisabledKeys] = useState(new Set<string>());
  const [practiceCorrectKeys, setPracticeCorrectKeys] = useState(new Set<string>());
  const [practicePresentKeys, setPracticePresentKeys] = useState(new Set<string>());

  const wordRef = useRef(word);
  const guessesRef = useRef(guesses);
  wordRef.current = word;
  guessesRef.current = guesses;

  const updateKeyStates = useCallback((guess: string, isDaily: boolean) => {
    const currentWord = isDaily ? wordRef.current : practiceWord;
    const newCorrectKeys = new Set(isDaily ? correctKeys : practiceCorrectKeys);
    const newPresentKeys = new Set(isDaily ? presentKeys : practicePresentKeys);
    const newDisabledKeys = new Set(isDaily ? disabledKeys : practiceDisabledKeys);
    const letterCounts: { [key: string]: number } = {};

    for (const letter of currentWord) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter === currentWord[i]) {
        newCorrectKeys.add(letter);
        letterCounts[letter]--;
      }
    }

    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      if (letter !== currentWord[i]) {
        if (letterCounts[letter] > 0) {
          newPresentKeys.add(letter);
          letterCounts[letter]--;
        } else {
          newDisabledKeys.add(letter);
        }
      }
    }

    if (isDaily) {
      setCorrectKeys(newCorrectKeys);
      setPresentKeys(newPresentKeys);
      setDisabledKeys(newDisabledKeys);
      localStorage.setItem('wordleKeyStates', JSON.stringify({
        correctKeys: Array.from(newCorrectKeys),
        presentKeys: Array.from(newPresentKeys),
        disabledKeys: Array.from(newDisabledKeys),
      }));
    } else {
      setPracticeCorrectKeys(newCorrectKeys);
      setPracticePresentKeys(newPresentKeys);
      setPracticeDisabledKeys(newDisabledKeys);
    }
  }, [correctKeys, presentKeys, disabledKeys, practiceCorrectKeys, practicePresentKeys, practiceDisabledKeys, practiceWord]);

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
      setDailyWordFound(parsedGuesses.includes(dailyWord));
      setGameOver(parsedGuesses.includes(dailyWord));
      setGameWon(parsedGuesses.includes(dailyWord));
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
    setStats(prevStats => {
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
    if (gameOver) return;

    const currentWordRef = isPracticeMode ? practiceWord : wordRef.current;
    const currentGuessesRef = isPracticeMode ? practiceGuesses : guessesRef.current;

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

      if (currentGuessesRef.includes(currentGuess)) {
        setShake(true);
        setTimeout(() => setShake(false), 300);
        alert('Bu söz artıq istifadə olunub!');
        return;
      }

      const newGuesses = [...currentGuessesRef, currentGuess].slice(0, MAX_ATTEMPTS);
      if (isPracticeMode) {
        setPracticeGuesses(newGuesses);
      } else {
        setGuesses(newGuesses);
        const currentDate = new Date().toDateString();
        localStorage.setItem(`wordleGuesses_daily_${currentDate}`, JSON.stringify(newGuesses));
      }
      updateKeyStates(currentGuess, !isPracticeMode);
      setCurrentGuess('');

      if (currentGuess === currentWordRef) {
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
        if (!isPracticeMode) {
          updateStats(false, newGuesses.length);
        }
      }
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key.toLowerCase());
    }
  }, [currentGuess, gameOver, updateKeyStates, updateStats, isPracticeMode, practiceWord, practiceGuesses]);

  const togglePracticeMode = useCallback(() => {
    if (isPracticeMode) {
      // Возвращаемся в ежедневный режим
      initializeGame();
    } else {
      // Переходим в практический режим
      setPracticeWord(getRandomWord());
      setPracticeGuesses([]);
      setPracticeDisabledKeys(new Set());
      setPracticeCorrectKeys(new Set());
      setPracticePresentKeys(new Set());
    }
    setIsPracticeMode(!isPracticeMode);
    setPracticeStreak(0);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
  }, [isPracticeMode, initializeGame]);

  return {
    word: isPracticeMode ? practiceWord : word,
    guesses: isPracticeMode ? practiceGuesses : guesses,
    currentGuess,
    gameOver,
    gameWon,
    disabledKeys: isPracticeMode ? practiceDisabledKeys : disabledKeys,
    correctKeys: isPracticeMode ? practiceCorrectKeys : correctKeys,
    presentKeys: isPracticeMode ? practicePresentKeys : presentKeys,
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
