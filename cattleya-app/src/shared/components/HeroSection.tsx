import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  badgeText?: string;
  badgeIcon?: ReactNode;
  title: ReactNode;
  subtitle?: string;
  backgroundType?: 'gradient' | 'orb' | 'none';
  className?: string;
}

export default function HeroSection({
  badgeText,
  badgeIcon,
  title,
  subtitle,
  backgroundType = 'gradient',
  className = '',
}: HeroSectionProps) {
  return (
    <section className={`relative w-full bg-transparent ${className}`}>
      {/* Soft background (optional, transparent by default) */}
      {backgroundType === 'gradient' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 pointer-events-none -z-10" />
      )}
      {backgroundType === 'orb' && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl -z-10" />
        </>
      )}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 flex flex-col items-center text-center">
        {badgeText && (
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6 mt-8 md:mt-12 shadow-sm">
            {badgeIcon && <span className="mr-2">{badgeIcon}</span>}
            {badgeText}
          </div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 bg-clip-text text-transparent drop-shadow-lg"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-2"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
} 