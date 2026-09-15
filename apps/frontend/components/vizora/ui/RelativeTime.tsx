'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type RelativeTimeProps = {
  date: string | Date;
  className?: string;
};

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function getRelativeTime(dateStr: string | Date): { value: string; absolute: string } {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  let value: string;
  if (Math.abs(diffSec) < 60) {
    value = 'just now';
  } else if (Math.abs(diffMin) < 60) {
    value = rtf.format(diffMin, 'minute');
  } else if (Math.abs(diffHour) < 24) {
    value = rtf.format(diffHour, 'hour');
  } else if (Math.abs(diffDay) < 7) {
    value = rtf.format(diffDay, 'day');
  } else if (Math.abs(diffDay) < 30) {
    value = rtf.format(diffWeek, 'week');
  } else if (Math.abs(diffDay) < 365) {
    value = rtf.format(diffMonth, 'month');
  } else {
    value = rtf.format(diffYear, 'year');
  }

  const absolute = date.toLocaleString();
  return { value, absolute };
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const { value, absolute } = getRelativeTime(date);
  const isoDate = typeof date === 'string' ? date : date.toISOString();

  return (
    <time dateTime={isoDate} title={absolute} className={className}>
      {value}
    </time>
  );
}
