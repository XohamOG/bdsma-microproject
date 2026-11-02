'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plane,
  PieChart,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Cpu,
  Database,
  FileText,
  Compass,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/bdsma', label: 'BDSMA Subject Lab', icon: BookOpen },
  { href: '/brands', label: 'Brand Directory', icon: Plane },
  { href: '/sentiment', label: 'Sentiment & Complaints', icon: PieChart },
  { href: '/trends', label: 'Trends & Anomalies', icon: TrendingUp },
  { href: '/compare', label: 'Brand Comparison', icon: BarChart3 },
  { href: '/tweets', label: 'Tweet Explorer', icon: MessageSquare },
  { href: '/benchmarks', label: 'Engine Benchmarks', icon: Cpu },
  { href: '/dataset', label: 'Dataset Ingestion', icon: Database },
  { href: '/reports', label: 'Reports & Export', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-[100dvh] bg-nouveau-cream/70 border-r border-nouveau-gold/40 flex flex-col justify-between p-4 sticky top-0 backdrop-blur-sm z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="pb-6 pt-2 px-2 border-b border-nouveau-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-nouveau-teal flex items-center justify-center text-nouveau-ivory shadow-nouveau border border-nouveau-gold">
              <Compass className="w-6 h-6 text-nouveau-gold animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-nouveau-charcoal leading-tight">
                AeroSentiment
              </h1>
              <p className="text-[11px] font-display text-nouveau-charcoal/70 tracking-wide">
                Brand Reputation System
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-nouveau-charcoal/60 px-1">
            <span>6 Monitored Airlines</span>
            <span className="text-nouveau-teal font-semibold">14.6k Tweets</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] font-display text-sm font-semibold transition-all duration-200 relative ${
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
                <span className="tracking-wide">{item.label}</span>
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
        <div className="bg-nouveau-ivory/80 rounded-[12px] p-3 border border-nouveau-gold/40 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-display font-medium text-nouveau-charcoal/70">Engine</span>
            <span className="font-mono text-nouveau-teal font-semibold">Spark / Node.js</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-display font-medium text-nouveau-charcoal/70">Dataset</span>
            <span className="font-mono text-nouveau-charcoal/80">Feb 17–24, 2015</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 text-nouveau-olive font-display text-[10px]">
            <span className="w-2 h-2 rounded-full bg-nouveau-olive inline-block animate-ping" />
            <span>Operational & Verified</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
