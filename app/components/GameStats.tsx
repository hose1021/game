import React from 'react';

interface GameStatsProps {
  stats: {
    played: number;
    won: number;
    currentStreak: number;
    maxStreak: number;
  };
}

export function GameStats({ stats }: GameStatsProps) {
  return (
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
  );
}