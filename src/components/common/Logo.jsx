import React from 'react';

/**
 * FinTrack Official Logo Component
 * Combines the official stylized brand mark and optional wordmark.
 */
export const Logo = ({ size = 32, showText = false, textClassName = '', className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="shrink-0 select-none drop-shadow-xs"
        aria-label="FinTrack Logo"
      >
        <defs>
          <linearGradient id="finLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="finLogoEmerald" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#finLogoBg)" />
        <g transform="translate(6, 6)">
          <rect x="0" y="0" width="4" height="20" rx="2" fill="#FFFFFF" />
          <path d="M 0 2 Q 0 0 2 0 L 16 0 Q 18 0 18 2 L 18 2 Q 18 4 16 4 L 2 4 Q 0 4 0 2 Z" fill="#FFFFFF" />
          <rect x="6" y="8" width="8" height="3.5" rx="1.75" fill="#FFFFFF" opacity="0.95" />
          <rect x="14" y="9" width="4" height="11" rx="2" fill="url(#finLogoEmerald)" />
          <circle cx="16" cy="3" r="1.8" fill="#34D399" />
        </g>
      </svg>

      {showText && (
        <span className={`font-bold tracking-tight text-on-surface ${textClassName}`}>
          FinTrack
        </span>
      )}
    </div>
  );
};
