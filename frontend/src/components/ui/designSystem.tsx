import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  RotateCcw,
} from 'lucide-react';

export type ApplicationStatusType =
  | 'APPROVED'
  | 'REJECTED'
  | 'UNDER_VERIFICATION'
  | 'SUBMITTED'
  | 'RESUBMITTED'
  | 'DRAFT'
  | string;

interface StatusBadgeProps {
  status: ApplicationStatusType;
  className?: string;
}

/**
 * Universal multi-signal Status Badge
 * Complies with WCAG guidelines: Uses color + icon + text label (never color alone).
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" aria-hidden="true" />
          <span>APPROVED</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/30 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-[#B91C1C] shrink-0" aria-hidden="true" />
          <span>ACTION REQUIRED</span>
        </span>
      );
    case 'UNDER_VERIFICATION':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B45309]/10 text-[#B45309] border border-[#B45309]/30 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-[#B45309] shrink-0" aria-hidden="true" />
          <span>UNDER VERIFICATION</span>
        </span>
      );
    case 'SUBMITTED':
    case 'RESUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF2FF] text-[#2563EB] border border-[#2563EB]/30 ${className}`}
        >
          {status === 'RESUBMITTED' ? (
            <RotateCcw className="w-3.5 h-3.5 text-[#2563EB] shrink-0" aria-hidden="true" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-[#2563EB] shrink-0" aria-hidden="true" />
          )}
          <span>{status}</span>
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-[#64748B] border border-slate-200 ${className}`}
        >
          <FileText className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
          <span>DRAFT</span>
        </span>
      );
  }
};

interface MetricCardProps {
  label: string;
  value: number | string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: 'blue' | 'amber' | 'green' | 'default';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  helperText,
  icon: Icon,
  tone = 'default',
  className = '',
}) => {
  const toneStyles = {
    blue: 'border-slate-200 bg-[#F8FAFC] text-[#2563EB]',
    amber: 'border-amber-200/80 bg-amber-50/60 text-[#B45309]',
    green: 'border-emerald-200/80 bg-emerald-50/60 text-[#15803D]',
    default: 'border-slate-200 bg-white text-[#0F172A]',
  };

  const numberColors = {
    blue: 'text-[#2563EB]',
    amber: 'text-[#B45309]',
    green: 'text-[#15803D]',
    default: 'text-[#0F172A]',
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${toneStyles[tone]} ${className}`}
    >
      {Icon && (
        <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center mb-2 shadow-2xs">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <span className={`text-2xl sm:text-3xl font-black block tracking-tight ${numberColors[tone]}`}>
        {value}
      </span>
      <span className="text-xs font-bold text-[#0F172A] block mt-0.5">
        {label}
      </span>
      {helperText && (
        <span className="text-[10px] text-[#64748B] font-medium hidden sm:block mt-0.5">
          {helperText}
        </span>
      )}
    </div>
  );
};
