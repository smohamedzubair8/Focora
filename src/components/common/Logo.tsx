import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', whiteText = false }) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Custom Focora Double-Loop Icon matching the Figma screen */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        <circle cx="10" cy="16" r="7" stroke="#2563EB" strokeWidth="4.5" />
        <circle cx="22" cy="16" r="7" stroke="#2563EB" strokeWidth="4.5" />
      </svg>
      <span className={`${textSize} font-extrabold ${whiteText ? 'text-white' : 'text-slate-900'} tracking-tight`}>
        Focora
      </span>
    </div>
  );
};
