import React from 'react';

interface Props {
  className?: string;
  label?: string;
}

export const WhiplashDivider: React.FC<Props> = ({ className = '', label = '♦' }) => {
  return (
    <div className={`relative flex items-center justify-center my-8 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-nouveau-gold to-transparent opacity-60" />
      </div>
      <div className="relative px-4 bg-nouveau-ivory text-nouveau-gold text-xs font-serif tracking-widest flex items-center gap-2">
        <span className="text-[10px] opacity-75">❧</span>
        <span className="font-semibold">{label}</span>
        <span className="text-[10px] opacity-75">☙</span>
      </div>
    </div>
  );
};
