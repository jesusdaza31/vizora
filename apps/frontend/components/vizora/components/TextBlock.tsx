'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { WidgetProps } from '@/lib/vizora/widget-registry';

const fontSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

export default function TextBlock({ config, theme }: WidgetProps) {
  const options = config.options as {
    content?: string;
    fontSize?: 'sm' | 'md' | 'lg';
    align?: 'left' | 'center' | 'right';
    title?: string;
  };

  const content = options.content ?? '';
  const fontSize = options.fontSize ?? 'md';
  const align = options.align ?? 'left';
  const title = options.title ?? '';

  return (
    <Card style={{ borderRadius: theme.borderRadius }} className="h-full">
      <CardContent className="flex h-full flex-col justify-center p-6">
        {title && (
          <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
        )}
        <p
          className={cn(
            'whitespace-pre-wrap text-foreground/80',
            fontSizeMap[fontSize],
            align === 'center' && 'text-center',
            align === 'right' && 'text-right',
            align === 'left' && 'text-left',
          )}
        >
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
