import React from 'react';

export const OrchidAvatar: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="orchidGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stopColor="#F7D6F7" />
        <stop offset="100%" stopColor="#B76FC6" />
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#orchidGradient)" />
    <ellipse cx="32" cy="40" rx="12" ry="8" fill="#E0A3E2" />
    <ellipse cx="32" cy="28" rx="16" ry="12" fill="#F7D6F7" />
    <ellipse cx="32" cy="32" rx="6" ry="4" fill="#B76FC6" />
    <ellipse cx="32" cy="36" rx="3" ry="2" fill="#fff" />
    <ellipse cx="24" cy="24" rx="3" ry="6" fill="#E0A3E2" transform="rotate(-20 24 24)" />
    <ellipse cx="40" cy="24" rx="3" ry="6" fill="#E0A3E2" transform="rotate(20 40 24)" />
  </svg>
); 