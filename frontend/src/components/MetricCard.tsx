import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  subtext?: string;
  onClickAction?: () => void;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  trendPositive = true,
  subtext,
  onClickAction,
  icon
}) => {
  return (
    <div className="relative p-5 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</span>
        {onClickAction ? (
          <button 
            onClick={onClickAction}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all"
            title="Inspect"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          icon && <div className="text-slate-400">{icon}</div>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <TrendingUp className="w-2.5 h-2.5" />
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[11px] text-slate-500 font-normal leading-relaxed">{subtext}</span>
      )}
    </div>
  );
};
