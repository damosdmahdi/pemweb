import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'danger' | 'info' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    warning: 'bg-amber-50 text-amber-900 border border-amber-200',
    neutral: 'bg-slate-100 text-slate-800 border border-slate-200',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim()}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};
