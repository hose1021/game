import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GameStatsProps {
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: number[];
  };
}

export const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  const { gamesPlayed, gamesWon, currentStreak, maxStreak, guessDistribution } = stats;
  const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const chartData = {
    labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: 'Qazanma sayı',
        data: guessDistribution,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="game-stats">
      <div className="stats-grid grid grid-cols-2 gap-4 mb-6">
        <div className="stat-item text-center">
          <span className="stat-value text-2xl font-bold">{gamesPlayed}</span>
          <span className="stat-label block">Oynanılan oyunlar</span>
        </div>
        <div className="stat-item text-center">
          <span className="stat-value text-2xl font-bold">{winPercentage}%</span>
          <span className="stat-label block">Qazanma %</span>
        </div>
        <div className="stat-item text-center">
          <span className="stat-value text-2xl font-bold">{currentStreak}</span>
          <span className="stat-label block">Cari seriya</span>
        </div>
        <div className="stat-item text-center">
          <span className="stat-value text-2xl font-bold">{maxStreak}</span>
          <span className="stat-label block">Maks. seriya</span>
        </div>
      </div>
      <div className="guess-distribution">
        <h3 className="text-xl font-bold mb-2">Təxmin paylanması</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default GameStats;