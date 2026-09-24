import React from 'react';

export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-card ${
        hover ? 'transition-all duration-200 hover:shadow-elevated hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>}
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-normal">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
