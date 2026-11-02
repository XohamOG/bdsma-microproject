import React from 'react';

interface Props {
  className?: string;
  label?: string;
}

export const WhiplashDivider: React.FC<Props> = ({ className = '', label }) => {
  return (
    <div className={`relative flex items-center justify-center my-8 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-nouveau-gold/40 to-transparent" />
      </div>
      {label && (
        <div className="relative px-4 bg-nouveau-ivory text-nouveau-gold/80 text-[11px] font-mono uppercase tracking-widest">
          <span>{label}</span>
        </div>
      )}
    </div>
  );
};
