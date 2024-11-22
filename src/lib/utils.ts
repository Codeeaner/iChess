import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeControl(initial: number, increment: number): string {
  const minutes = Math.floor(initial / 60);
  return `${minutes}+${increment}`;
}

export function formatGameResult(result: string | null): string {
  if (!result) return 'Game in progress';
  
  switch (result) {
    case '1-0': return 'White wins';
    case '0-1': return 'Black wins';
    case '1/2-1/2': return 'Draw';
    default: return result;
  }
}

export function calculateTimeLeft(startTime: Date, duration: number): string {
  const now = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}