'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Cpu,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Project Overview', icon: Compass },
  { href: '/dashboard', label: 'Live Analytics', icon: LayoutDashboard },
  { href: '/compare', label: 'Compare Airlines', icon: BarChart3 },
  { href: '/tweets', label: 'Tweet Explorer', icon: MessageSquare },
  { href: '/benchmarks', label: 'Big Data Benchmarks', icon: Cpu },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-[100dvh] bg-nouveau-cream/80 border-r border-nouveau-gold/40 flex flex-col justify-between p-4 sticky top-0 backdrop-blur-sm z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="pb-6 pt-2 px-2 border-b border-nouveau-gold/30">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-[12px] bg-nouveau-teal flex items-center justify-center text-nouveau-ivory shadow-nouveau border border-nouveau-gold/70 group-hover:bg-[#006e6e] transition-colors">
              <Compass className="w-5 h-5 text-nouveau-gold" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-nouveau-charcoal leading-tight">
                AeroSentiment
              </h1>
              <p className="text-[11px] font-mono text-nouveau-charcoal/60">
                Big Data Analytics
              </p>
            </div>
          </Link>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-nouveau-charcoal/60 px-1">
            <span>6 Major Airlines</span>
            <span className="text-nouveau-teal font-semibold">14,485 Tweets</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? pathname === '/' 
              : pathname === item.href || pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] font-display text-xs font-semibold tracking-wide transition-all duration-200 relative ${
                  isActive
                    ? 'bg-nouveau-teal text-nouveau-ivory shadow-nouveau-lift border border-nouveau-gold/60'
                    : 'text-nouveau-charcoal hover:bg-nouveau-ivory hover:text-nouveau-teal hover:shadow-nouveau border border-transparent hover:border-nouveau-gold/30'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-nouveau-gold' : 'text-nouveau-charcoal/70 group-hover:text-nouveau-teal'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-nouveau-gold" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-nouveau-gold/30 px-2">
        <div className="bg-nouveau-ivory/90 rounded-[12px] p-3 border border-nouveau-gold/40 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-display font-medium text-nouveau-charcoal/70">Engine</span>
            <span className="font-mono text-nouveau-teal font-semibold">PySpark + Node.js</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display font-medium text-nouveau-charcoal/70">Storage</span>
            <span className="font-mono text-nouveau-charcoal/80">Parquet + SQL</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-nouveau-olive font-display text-[11px]">
            <span className="w-2 h-2 rounded-full bg-nouveau-olive inline-block animate-pulse" />
            <span className="font-semibold">Live Backend Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
