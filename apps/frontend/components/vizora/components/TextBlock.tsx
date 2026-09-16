'use client';

import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

export default function TextBlock({ config, data, theme, isLoading }: WidgetProps) {
  const options = config.options as { content?: string; fontSize?: 'sm' | 'md' | 'lg'; align?: 'left' | 'center' | 'right'; title?: string };
  const content = options.content ?? 'Add your text here...';
  const fontSize = options.fontSize ?? 'md';
  const align = options.align ?? 'left';
  const title = options.title ?? '';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  return (
    <div className={cn(
      'flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm',
      align === 'center' && 'items-center text-center',
      align === 'right' && 'items-end text-right',
    )}>
      {title && <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>}
      <div className="flex-1">
        <p className={cn(
          'whitespace-pre-wrap text-slate-700',
          fontSize === 'sm' && 'text-sm',
          fontSize === 'md' && 'text-base',
          fontSize === 'lg' && 'text-lg',
        )}>
          {content}
        </p>
      </div>
    </div>
  );
}
