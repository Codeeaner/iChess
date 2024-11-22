import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  className, 
  size = 'md',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
        <Loader2 className={cn(
          'animate-spin text-blue-500',
          sizeClasses[size],
          className
        )} />
      </div>
    );
  }

  return (
    <Loader2 className={cn(
      'animate-spin text-blue-500',
      sizeClasses[size],
      className
    )} />
  );
}