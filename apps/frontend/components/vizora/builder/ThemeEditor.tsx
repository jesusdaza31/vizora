'use client';

import React, { useState, useCallback } from 'react';
import { useBuilderStore } from '@/store/vizora-builder-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Plus, Trash2, RotateCcw } from 'lucide-react';
import type { ThemeConfig, FontSize, BorderRadius } from '@/lib/vizora/types';

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: '#06b6d4',
  chartPalette: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
  fontSize: 'md',
  borderRadius: 12,
};

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const BORDER_RADIUS_OPTIONS: { value: BorderRadius; label: string }[] = [
  { value: 8, label: '8px' },
  { value: 12, label: '12px' },
  { value: 16, label: '16px' },
];

const MIN_PALETTE = 3;
const MAX_PALETTE = 8;

type ThemeEditorProps = {
  open: boolean;
  onClose: () => void;
};

export function ThemeEditor({ open, onClose }: ThemeEditorProps) {
  const dashboard = useBuilderStore((s) => s.dashboard);
  const updateTheme = useBuilderStore((s) => s.updateTheme);

  const currentTheme = dashboard?.config.theme ?? DEFAULT_THEME;
  const [draft, setDraft] = useState<ThemeConfig>(currentTheme);

  React.useEffect(() => {
    if (open && dashboard) {
      setDraft(dashboard.config.theme);
    }
  }, [open, dashboard]);

  const applyDraft = useCallback(
    (next: ThemeConfig) => {
      setDraft(next);
      updateTheme(next);
    },
    [updateTheme],
  );

  const handlePrimaryColor = (color: string) => {
    applyDraft({ ...draft, primaryColor: color });
  };

  const handlePaletteChange = (index: number, color: string) => {
    const next = [...draft.chartPalette];
    next[index] = color;
    applyDraft({ ...draft, chartPalette: next });
  };

  const handleAddPaletteColor = () => {
    if (draft.chartPalette.length >= MAX_PALETTE) return;
    applyDraft({ ...draft, chartPalette: [...draft.chartPalette, '#64748b'] });
  };

  const handleRemovePaletteColor = (index: number) => {
    if (draft.chartPalette.length <= MIN_PALETTE) return;
    const next = draft.chartPalette.filter((_, i) => i !== index);
    applyDraft({ ...draft, chartPalette: next });
  };

  const handleFontSize = (size: FontSize) => {
    applyDraft({ ...draft, fontSize: size });
  };

  const handleBorderRadius = (radius: BorderRadius) => {
    applyDraft({ ...draft, borderRadius: radius });
  };

  const handleReset = () => {
    applyDraft(DEFAULT_THEME);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Theme</h2>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.primaryColor}
                onChange={(e) => handlePrimaryColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-border p-0.5"
              />
              <span className="text-xs font-mono text-muted-foreground">{draft.primaryColor}</span>
            </div>
          </section>

          <section>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Chart Palette
            </label>
            <div className="grid grid-cols-4 gap-2">
              {draft.chartPalette.map((color, i) => (
                <div key={i} className="group relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handlePaletteChange(i, e.target.value)}
                    className="h-8 w-full cursor-pointer rounded border border-border p-0.5"
                  />
                  {draft.chartPalette.length > MIN_PALETTE && (
                    <button
                      onClick={() => handleRemovePaletteColor(i)}
                      className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-white group-hover:block"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
              {draft.chartPalette.length < MAX_PALETTE && (
                <button
                  onClick={handleAddPaletteColor}
                  className="flex h-8 w-full items-center justify-center rounded border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </section>

          <section>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Font Size
            </label>
            <div className="flex gap-1.5">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFontSize(opt.value)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    draft.fontSize === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Border Radius
            </label>
            <div className="flex gap-1.5">
              {BORDER_RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleBorderRadius(opt.value)}
                  className={cn(
                    'flex-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    draft.borderRadius === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Preview
            </label>
            <div
              className="rounded-lg border border-border bg-card p-3"
              style={{ borderRadius: draft.borderRadius }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: draft.primaryColor }}
                />
                <span className="text-xs font-medium" style={{ fontSize: draft.fontSize === 'sm' ? 12 : draft.fontSize === 'lg' ? 16 : 14 }}>
                  Sample Title
                </span>
              </div>
              <div className="flex gap-1">
                {draft.chartPalette.slice(0, 6).map((c, i) => (
                  <div key={i} className="h-4 flex-1 rounded" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
