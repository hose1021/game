'use client'

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useWordle } from '../hooks/useWordle';
import Keyboard from './Keyboard';
import Modal from './Modal';
import { useTheme } from 'next-themes';
import { GameBoard } from './GameBoard';
import html2canvas from 'html2canvas';
import { FiMoon, FiSun, FiShare2, FiHelpCircle, FiBarChart2, FiSend, FiPlay, FiSquare } from 'react-icons/fi';
import GameStats from './GameStats';
import Image from 'next/image';

export default function Wordle() {
  const {
    word,
    guesses,
    currentGuess,
    gameOver,
    gameWon,
    disabledKeys,
    correctKeys,
    presentKeys,
    timeUntilNextWord,
    stats,
    handleKeyPress,
    isPracticeMode,
    togglePracticeMode,
    practiceStreak,
    dailyWordFound,
  } = useWordle();

  const [showRules, setShowRules] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [shareImage, setShareImage] = useState<string | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const renderGuessMap = () => {
    const guessMap = guesses.map(guess =>
      guess.split('').map((letter, index) => {
        if (word[index] === letter) {
          return 'correct';
        } else if (word.includes(letter)) {
          return 'present';
        } else {
          return 'absent';
        }
      })
    );

    while (guessMap.length < 6) {
      guessMap.push(Array(5).fill('empty'));
    }

    return (
      <div className="grid gap-1">
        {guessMap.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((status, letterIndex) => (
              <div
                key={letterIndex}
                className={`w-6 h-6 border-2 ${
                  status === 'correct' ? 'bg-wordle-correct border-wordle-correct' :
                  status === 'present' ? 'bg-wordle-present border-wordle-present' :
                  status === 'absent' ? 'bg-wordle-absent border-wordle-absent' :
                  'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                }`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const guessMapRef = useRef<HTMLDivElement>(null);

  const generateShareImage = async () => {
    if (!guessMapRef.current) return null;

    const canvas = await html2canvas(guessMapRef.current, {
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
    });
    return canvas.toDataURL('image/png');
  };

  const shareResult = async (platform: 'twitter' | 'whatsapp' | 'telegram') => {
    const imageUrl = await generateShareImage();
    if (!imageUrl) {
      console.error('Failed to generate share image');
      return;
    }
    setShareImage(imageUrl);

    const guessMap = guesses.map(guess =>
      guess.split('').map((letter, index) =>
        word[index] === letter ? '🟩' : word.includes(letter) ? '🟨' : '⬛'
      ).join('')
    );

    while (guessMap.length < 6) {
      guessMap.push('⬛'.repeat(5));
    }

    const resultMap = guessMap.join('\n');

    const shareText = `Azərbaycan Wordle\n\n${resultMap}\n\n#azwordle\n\nSözü təxmin edin https://hose1021.github.io/game/`;
    const url = 'https://hose1021.github.io/game/';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  useEffect(() => {
    if (gameWon) {
      setShowWinModal(true);
    }
  }, [gameWon]);

  const handleCloseWinModal = () => {
    setShowWinModal(false);
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background-secondary text-foreground"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <header className="w-full px-4 py-2">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button onClick={() => setShowRules(true)} className="text-sm p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <FiHelpCircle size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Azərbaycan Wordle</h1>
          <div className="flex items-center space-x-2">
            <button onClick={togglePracticeMode} className="text-sm p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {isPracticeMode ? <FiSquare size={24} /> : <FiPlay size={24} />}
            </button>
            <button onClick={() => setShowStats(true)} className="text-sm p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <FiBarChart2 size={24} />
            </button>
            <button onClick={toggleTheme} className="text-sm p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
            </button>
          </div>
        </div>
        {!isPracticeMode && !dailyWordFound && (
          <div className="text-sm text-center font-medium mt-2">Növbəti söz: <span className="font-bold">{timeUntilNextWord}</span></div>
        )}
        {isPracticeMode && (
          <div className="text-sm text-center font-medium mt-2">
            Praktika rejimi - Ardıcıl qazanılan: <span className="font-bold">{practiceStreak}</span>
          </div>
        )}
        {!isPracticeMode && dailyWordFound && (
          <div className="text-sm text-center font-medium mt-2">
            Gündəlik söz tapıldı. Praktika rejimində oynamaq üçün yuxarıdakı düyməyə basın.
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg flex justify-center">
          <GameBoard 
            guesses={guesses}
            currentGuess={currentGuess}
            word={word}
            gameOver={gameOver}
          />
        </div>

        {gameOver && (
          <div className="flex flex-col items-center mt-8 animate-fade-in">
            <div className="text-xl sm:text-2xl font-bold mb-4">
              {gameWon ? `Təbriklər 🎉` : `Oyun bitdi. Söz: ${word}`}
            </div>
            {gameWon && (
              <button onClick={() => setShowWinModal(true)} className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
                <FiShare2 className="mr-2" /> Nəticəni paylaş
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer with keyboard */}
      <footer className="w-full px-4 py-2 bg-background">
        <div className="max-w-lg mx-auto">
          {!gameOver && !isPracticeMode && (
            <Keyboard 
              onKeyPress={handleKeyPress} 
              disabledKeys={disabledKeys}
              correctKeys={correctKeys}
              presentKeys={presentKeys}
            />
          )}
          {isPracticeMode && (
            <Keyboard 
              onKeyPress={handleKeyPress} 
              disabledKeys={disabledKeys}
              correctKeys={correctKeys}
              presentKeys={presentKeys}
            />
          )}
        </div>
      </footer>

      {/* Modals */}
      <Modal isOpen={showRules} onClose={() => setShowRules(false)}>
        <h2 className="text-2xl font-bold mb-4">Qaydalar</h2>
        <p className="mb-4">Hər gün yeni bir 5 hərfli Azərbaycan sözü təxmin etmək üçün 6 cəhdiniz var. Hər cəhdinizdən sonra hərflərin yerləşdiyi yeri və hərflərin rəngini görəcəksiniz.</p>
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
            <span className="font-bold">K</span> hərfi düzgün yerdədir
          </p>
          <div className="flex mb-2">
            <span className="letter mr-1">A</span>
            <span className="letter bg-wordle-present text-white mr-1">L</span>
            <span className="letter mr-1">M</span>
            <span className="letter mr-1">A</span>
            <span className="letter">S</span>
          </div>
          <p className="mb-2">
            <span className="font-bold">L</span> hərfi sözdə var, lakin düzgün yerdə deyil
          </p>
          <div className="flex mb-2">
            <span className="letter mr-1">Q</span>
            <span className="letter mr-1">A</span>
            <span className="letter mr-1">P</span>
            <span className="letter bg-wordle-absent text-white mr-1">I</span>
            <span className="letter">Ş</span>
          </div>
          <p>
            <span className="font-bold">I</span> hərfi sözdə yoxdur
          </p>
        </div>
        <p className="mb-2">Eyni sözü təkrar istifadə edə bilməzsiniz.</p>
        <p className="mb-2">Gündəlik sözü tapdıqdan sonra, praktika rejimində oynamağa davam edə bilərsiniz.</p>
        <p className="mb-2">Praktika rejimində ardıcıl qazanılan oyunların sayı hesablanır.</p>
        <p className="mb-2">Oyun nəticələrinizi Twitter, WhatsApp və ya Telegram vasitəsilə paylaşa bilərsiniz.</p>
        <p>Uğurlar!</p>
      </Modal>
      
      <Modal isOpen={showWinModal} onClose={handleCloseWinModal}>
        <h2 className="text-2xl font-bold mb-4">Təbriklər 🎉</h2>
        <p className="mb-4">{guesses.length} cəhdədə uğurla qazandınız!</p>
        <div className="mb-4" ref={guessMapRef}>
          <h3 className="text-xl font-bold mb-2">Təxminləriniz:</h3>
          {renderGuessMap()}
        </div>
        <div className="flex flex-col sm:flex-row justify-around mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <button 
            onClick={() => shareResult('twitter')} 
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            <FiShare2 className="mr-2" /> Twitter
          </button>
          <button 
            onClick={() => shareResult('whatsapp')} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            <FiShare2 className="mr-2" /> WhatsApp
          </button>
          <button 
            onClick={() => shareResult('telegram')} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            <FiSend className="mr-2" /> Telegram
          </button>
        </div>
        {shareImage && (
          <div className="mt-4">
            <p className="mb-2">Yükləmək üçün klik edin:</p>
            <a href={shareImage} download="wordle_result.png">
              <Image src={shareImage} alt="Wordle result" width={300} height={300} layout="responsive" />
            </a>
          </div>
        )}
      </Modal>
      
      <Modal isOpen={showStats} onClose={() => setShowStats(false)}>
        <h2 className="text-2xl font-bold mb-4">Statistika</h2>
        <GameStats 
          stats={{
            gamesPlayed: stats.played,
            gamesWon: stats.won,
            currentStreak: stats.currentStreak,
            maxStreak: stats.maxStreak,
            guessDistribution: stats.guessDistribution
          }} 
        />
      </Modal>
    </div>
  );
}