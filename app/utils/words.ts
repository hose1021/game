import {WORDS} from "@/app/words/az";


const WORDS_SET = new Set(WORDS);

export function isValidWord(word: string): boolean {
  return WORDS_SET.has(word);
}

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// Кэшируем дату следующего слова
let nextWordDate: Date | null = null;

export function getNextWordTime(): Date {
  if (!nextWordDate || nextWordDate < new Date()) {
    nextWordDate = new Date();
    nextWordDate.setDate(nextWordDate.getDate() + 1);
    nextWordDate.setHours(0, 0, 0, 0);
  }
  return nextWordDate;
}

// Добавляем функцию getDailyWord
export function getDailyWord(): string {
  const today = new Date();
  const index = (today.getFullYear() * 365 + today.getMonth() * 31 + today.getDate()) % WORDS.length;
  return WORDS[index];
}
