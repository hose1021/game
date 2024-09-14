import Wordle from './components/Wordle';
import { ThemeProvider } from 'next-themes';

export default function Home() {
  return (
    <ThemeProvider attribute="class">
      <main className="min-h-screen bg-background text-foreground">
        <Wordle />
      </main>
    </ThemeProvider>
  );
}
