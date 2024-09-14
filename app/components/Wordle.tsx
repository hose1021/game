'use client'

import React, { useCallback, useRef, useState } from 'react';
import { useWordle } from '../hooks/useWordle';
import Keyboard from './Keyboard';
import Modal from './Modal';
import { useTheme } from 'next-themes';
import { GameBoard } from './GameBoard';
import { GameStats } from './GameStats';
import html2canvas from 'html2canvas';

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
    shake,
    timeUntilNextWord,
    showWinModal,
    stats,
    handleKeyPress,
    setShowWinModal,
  } = useWordle();

  const [showRules, setShowRules] = React.useState(false);
  const [showStats, setShowStats] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [shareImage, setShareImage] = useState<string | null>(null);

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

  const shareResult = async (platform: 'twitter' | 'whatsapp' | 'instagram') => {
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

    const shareText = `Azərbaycan Wordle - Mən bu sözü ${guesses.length} cəhddə tapdım. Sən də sına!\n\n${resultMap}`;
    const url = 'https://your-game-url.com';

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + url)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareText + '\n' + url);
        alert('Mətn kopyalandı. Instagramda paylaşmaq üçün şəkli yükləyin və mətni yapışdırın.');
        return;
    }

    window.open(shareUrl, '_blank');
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
      <GameBoard 
        guesses={guesses}
        currentGuess={currentGuess}
        shake={shake}
        word={word}
        gameOver={gameOver}
      />
      {gameOver && (
        <div className="flex flex-col items-center mb-8">
          <div className="text-xl sm:text-2xl font-bold animate-bounce mb-4">
            {gameWon ? 'Təbrik edirik! 🎉' : `Oyun bitdi. Söz: ${word}`}
          </div>
          {gameWon && (
            <button onClick={() => setShowWinModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2">
              Nəticəni paylaş
            </button>
          )}
        </div>
      )}
      {!gameOver && (
        <Keyboard 
          onKeyPress={handleKeyPress} 
          disabledKeys={disabledKeys}
          correctKeys={correctKeys}
          presentKeys={presentKeys}
        />
      )}
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
        <h2 className="text-2xl font-bold mb-4">Təbrik edirik! 🎉</h2>
        <p className="mb-4">Siz sözü {guesses.length} cəhddə tapdınız.</p>
        <div className="mb-4" ref={guessMapRef}>
          <h3 className="text-xl font-bold mb-2">Sizin addımlarınız:</h3>
          {renderGuessMap()}
        </div>
        <div className="flex justify-around mb-4">
          <button 
            onClick={() => shareResult('twitter')} 
            className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Twitter
          </button>
          <button 
            onClick={() => shareResult('whatsapp')} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            WhatsApp
          </button>
          <button 
            onClick={() => shareResult('instagram')} 
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
          >
            Instagram
          </button>
        </div>
        {shareImage && (
          <div className="mt-4">
            <p className="mb-2">Şəkli yükləmək üçün klikləyin:</p>
            <a href={shareImage} download="wordle_result.png">
              <img src={shareImage} alt="Wordle result" className="max-w-full h-auto" />
            </a>
          </div>
        )}
      </Modal>
      
      <Modal isOpen={showStats} onClose={() => setShowStats(false)}>
        <h2 className="text-2xl font-bold mb-4">Statistika</h2>
        <GameStats stats={stats} />
      </Modal>
    </div>
  );
}