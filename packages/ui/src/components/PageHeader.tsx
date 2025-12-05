import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle, className, ...props }: PageHeaderProps) {
  return (
    <header
      className={cn('mb-8 space-y-2 text-center', className)}
      {...props}
    >
      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="text-lg text-muted-foreground">{subtitle}</p>
      ) : null}
    </header>
  );
}

