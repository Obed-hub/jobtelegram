import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { TodayProgress } from './TodayProgress';
import { UserProfile } from '@/types/job';

interface ProgressSwipeCardProps {
  profile: Partial<UserProfile>;
  onUpgrade: () => void;
  onSwipe: () => void;
}

export const ProgressSwipeCard = forwardRef<HTMLDivElement, ProgressSwipeCardProps>(
  ({ profile, onUpgrade, onSwipe }, ref) => {
    return (
      <motion.div
        ref={ref}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-20"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 100) onSwipe();
        }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <div className="h-full flex flex-col justify-center">
          <TodayProgress 
            profile={profile} 
            onUpgrade={onUpgrade} 
            className="h-full p-8 flex flex-col justify-center"
          />
          {/* Swipe hints */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center text-xs text-muted-foreground/40 animate-pulse pointer-events-none">
            Swipe left or right to start searching →
          </div>
        </div>
      </motion.div>
    );
  }
);

ProgressSwipeCard.displayName = 'ProgressSwipeCard';
