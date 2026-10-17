import React from 'react';
import { EvidenceStatus } from '../types';
import { CheckCircle2, Check, AlertCircle, HelpCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  status: EvidenceStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const EvidenceBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = HelpCircle;

  switch (status) {
    case 'Strongly supported':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'Supported':
      colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = Check;
      break;
    case 'Partially supported':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = AlertCircle;
      break;
    case 'Not yet verified':
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      Icon = HelpCircle;
      break;
    case 'Conflicting evidence':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = AlertTriangle;
      break;
    case 'Assessment unavailable':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = XCircle;
      break;
    default:
      colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
      Icon = HelpCircle;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1.5' 
      : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colorClasses} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{status}</span>
    </span>
  );
};
