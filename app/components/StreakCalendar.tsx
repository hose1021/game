import React from 'react';

interface StreakCalendarProps {
  streakDays: string[]; // Array of dates (YYYY-MM-DD) when the user won
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ streakDays }) => {
  const today = new Date();
  const calendar = [];

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const isStreak = streakDays.includes(dateString);

    calendar.unshift(
      <div 
        key={dateString} 
        className={`w-3 h-3 rounded-sm ${
          isStreak ? 'bg-green-500' : 'bg-gray-300'
        }`}
        title={dateString}
      />
    );
  }

  return (
    <div className="streak-calendar mt-8">
      <h3 className="text-xl font-bold mb-2">Streak Kalendar</h3>
      <div className="grid grid-cols-52 gap-1">
        {calendar}
      </div>
    </div>
  );
};

export default StreakCalendar;