'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDailyWord, getNextWordTime, isValidWord } from '../utils/words';
import Keyboard from './Keyboard';
import Modal from './Modal';
import { useTheme } from 'next-themes';

const MAX_ATTEMPTS = 6;

export default function Wordle() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());
  const [showRules, setShowRules] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [stats, setStats] = useState({ played: 0, won: 0, currentStreak: 0, maxStreak: 0 });
  const [shake, setShake] = useState(false);
  const [timeUntilNextWord, setTimeUntilNextWord] = useState('');
  const { theme, setTheme } = useTheme();
  const [correctKeys, setCorrectKeys] = useState<Set<string>>(new Set());
  const [presentKeys, setPresentKeys] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dailyWord = getDailyWord();
    setWord(dailyWord);
    const savedGuesses = localStorage.getItem(`wordleGuesses_${dailyWord}`);
    if (savedGuesses) {
      setGuesses(JSON.parse(savedGuesses));
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameOver) return;

    const key = event.key.toLowerCase();
    if (key === 'enter') {
      handleKeyPress('Enter');
    } else if (key === 'backspace') {
      handleKeyPress('Backspace');
    } else if (/^[a-zəğıöüçş]$/.test(key)) {
      handleKeyPress(key);
    }
  }, [gameOver, handleKeyPress]);

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

  const shareResult = () => {
    const guessMap = guesses.map(guess =>
      guess.split('').map((letter, index) =>
        word[index] === letter ? '🟩' : word.includes(letter) ? '🟨' : '⬜'
      ).join('')
    );

    while (guessMap.length < 6) {
      guessMap.push('⬜'.repeat(5));
    }

    const result = guessMap.join('\n');
    
    const shareText = `Azərbaycan Wordle ${stats.played}\n\n${result}\n\nhttps://your-game-url.com`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Azərbaycan Wordle Nəticəsi',
        text: shareText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Nəticə kopyalandı!');
    }
  };

  const renderGuessMap = () => {
    const guessMap = guesses.map(guess =>
      guess.split('').map((letter, index) =>
        word[index] === letter ? '🟩' : word.includes(letter) ? '🟨' : '⬜'
      ).join('')
    );

    // Добавляем пустые строки, если количество попыток меньше 6
    while (guessMap.length < 6) {
      guessMap.push('⬜'.repeat(5));
    }

    return (
      <div className="grid gap-1">
        {guessMap.map((row, index) => (
          <div key={index} className="flex gap-1">
            {row.split('').map((cube, cubeIndex) => (
              <span key={cubeIndex} className="text-2xl">{cube}</span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
    <div 
      className="flex flex-col items-center min-h-screen bg-background text-foreground py-8 px-4"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between w-full max-w-lg mb-8">
        <button onClick={() => setShowRules(true)} className="text-sm underline">Qaydalar</button>
        <h1 className="text-2xl sm:text-4xl font-bold">Azərbaycan Wordle</h1>
        <button onClick={toggleTheme} className="text-sm underline">
          {theme === 'dark' ? 'İşıqlı' : 'Qaranlıq'} Tema
        </button>
      </div>
      <div className="text-sm mb-4">Növbəti söz: {timeUntilNextWord}</div>
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
      {gameOver && (
        <div className="flex flex-col items-center mb-8">
          <div className="text-xl sm:text-2xl font-bold animate-bounce mb-4">
            {word === guesses[guesses.length - 1] ? 'Təbrik edirik!' : `Oyun bitdi. Söz: ${word}`}
          </div>
          <button onClick={shareResult} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Paylaş
          </button>
        </div>
      )}
      <Keyboard 
        onKeyPress={handleKeyPress} 
        disabledKeys={disabledKeys}
        correctKeys={correctKeys}
        presentKeys={presentKeys}
      />
      <button onClick={() => setShowStats(true)} className="mt-4 text-sm underline">
        Statistika
      </button>
      <Modal isOpen={showRules} onClose={() => setShowRules(false)}>
        <h2 className="text-2xl font-bold mb-4">Oyun Qaydaları</h2>
        <p className="mb-4">5 hərfli sözü 6 cəhddə tapın. Hər təxmindən sonra kafellərin rəngi dəyişəcək.</p>
        <div className="mb-4">
          <p className="font-bold mb-2">Nümunələr:</p>
          <div className="flex mb-2">
            <span className="letter bg-wordle-correct text-white mr-1">K</span>
            <span className="letter mr-1">İ</span>
            <span className="letter mr-1">T</span>
            <span className="letter mr-1">A</span>
            <span className="letter">B</span>
          </div>
          <p className="mb-2">
            <span className="font-bold">K</span> hərfi düzgün yerdədir (yaşıl).
          </p>
          <div className="flex mb-2">
            <span className="letter mr-1">A</span>
            <span className="letter bg-wordle-present text-white mr-1">L</span>
            <span className="letter mr-1">M</span>
            <span className="letter mr-1">A</span>
            <span className="letter">S</span>
          </div>
          <p className="mb-2">
            <span className="font-bold">L</span> hərfi sözdə var, amma yanlış yerdədir (sarı).
          </p>
          <div className="flex mb-2">
            <span className="letter mr-1">Q</span>
            <span className="letter mr-1">A</span>
            <span className="letter mr-1">P</span>
            <span className="letter bg-wordle-absent text-white mr-1">I</span>
            <span className="letter">Ş</span>
          </div>
          <p>
            <span className="font-bold">I</span> hərfi sözdə yoxdur (boz).
          </p>
        </div>
        <p className="mb-2">Hər gün yeni söz olacaq!</p>
        <p>Uğurlar!</p>
      </Modal>
      
      <Modal isOpen={showWinModal} onClose={() => setShowWinModal(false)}>
        <h2 className="text-2xl font-bold mb-4">Təbrik edirik!</h2>
        <p className="mb-4">Siz sözü {guesses.length} cəhddə tapdınız.</p>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2">Sizin addımlarınız:</h3>
          {renderGuessMap()}
        </div>
        <button 
          onClick={shareResult} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Nəticəni paylaş
        </button>
      </Modal>
      
      <Modal isOpen={showStats} onClose={() => setShowStats(false)}>
        <h2 className="text-2xl font-bold mb-4">Statistika</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.played}</div>
            <div className="text-sm">Oynanılıb</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{Math.round((stats.won / stats.played) * 100) || 0}%</div>
            <div className="text-sm">Qazanma %</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm">Cari seriya</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm">Ən yaxşı seriya</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}